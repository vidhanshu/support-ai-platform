import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { PLAN_LIMITS, type PlanId, ENV_KEYS } from "@repo/config";
import {
  PrismaService,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@repo/database";
import { ConfigService } from "@nestjs/config";
import type Stripe from "stripe";
import type { JwtUser } from "../auth/interfaces/jwt.interface";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import type {
  BillingStatusResponse,
  CheckoutSessionResponse,
  PaidPlan,
} from "./billing.types";
import { PlanLimitsService } from "./plan-limits.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly planLimits: PlanLimitsService,
    private readonly config: ConfigService,
  ) {}

  async getBillingStatus(
    workspace: WorkspaceContext,
  ): Promise<BillingStatusResponse> {
    const subscription = await this.planLimits.getOrCreateSubscription(
      workspace.id,
    );
    const limits = PLAN_LIMITS[subscription.plan as PlanId];
    const chatMessagesThisMonth = await this.planLimits.getChatUsage(
      workspace.id,
    );

    return {
      plan: subscription.plan,
      status: subscription.status,
      limits,
      usage: { chatMessagesThisMonth },
      subscription:
        subscription.plan === SubscriptionPlan.FREE
          ? null
          : {
              currentPeriodStart:
                subscription.currentPeriodStart?.toISOString() ?? null,
              currentPeriodEnd:
                subscription.currentPeriodEnd?.toISOString() ?? null,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            },
    };
  }

  async createCheckoutSession(
    workspace: WorkspaceContext,
    user: JwtUser,
    plan: PaidPlan,
  ): Promise<CheckoutSessionResponse> {
    const subscription = await this.planLimits.getOrCreateSubscription(
      workspace.id,
    );

    if (subscription.plan === plan && subscription.stripeSubscriptionId) {
      throw new BadRequestException(`Workspace is already on the ${plan} plan`);
    }

    const customerId = await this.ensureStripeCustomer(
      workspace,
      user,
      subscription.id,
      subscription.stripeCustomerId,
    );

    const appWebUrl = this.config
      .getOrThrow<string>(ENV_KEYS.APP_WEB_URL)
      .replace(/\/$/, "");

    const session = await this.stripe.createCheckoutSession({
      customerId,
      priceId: this.stripe.priceIdForPlan(plan),
      workspaceId: workspace.id,
      plan,
      successUrl: `${appWebUrl}/dashboard/${workspace.slug}/settings/billing?billing=success`,
      cancelUrl: `${appWebUrl}/dashboard/${workspace.slug}/settings/plans?billing=cancel`,
    });

    if (!session.url) {
      throw new BadRequestException("Unable to create checkout session");
    }

    return { url: session.url };
  }

  async changePlan(
    workspace: WorkspaceContext,
    user: JwtUser,
    targetPlan: SubscriptionPlan,
  ) {
    const subscription = await this.planLimits.getOrCreateSubscription(
      workspace.id,
    );
    const current = subscription.plan;

    if (current === targetPlan && !subscription.cancelAtPeriodEnd) {
      throw new BadRequestException(`Already on the ${targetPlan} plan`);
    }

    // FREE → paid: Checkout
    if (
      current === SubscriptionPlan.FREE &&
      (targetPlan === SubscriptionPlan.HOBBY ||
        targetPlan === SubscriptionPlan.PRO)
    ) {
      return this.createCheckoutSession(workspace, user, targetPlan);
    }

    // Paid → FREE: cancel at period end (webhook syncs state)
    if (
      targetPlan === SubscriptionPlan.FREE &&
      (current === SubscriptionPlan.HOBBY || current === SubscriptionPlan.PRO)
    ) {
      if (!subscription.stripeSubscriptionId) {
        throw new BadRequestException("No active Stripe subscription to cancel");
      }

      const updated = await this.stripe.cancelAtPeriodEnd(
        subscription.stripeSubscriptionId,
      );
      await this.syncSubscriptionFromStripe(updated);

      return {
        action: "cancel_at_period_end" as const,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      };
    }

    // Paid → other paid: update Stripe subscription price
    if (
      (current === SubscriptionPlan.HOBBY ||
        current === SubscriptionPlan.PRO) &&
      (targetPlan === SubscriptionPlan.HOBBY ||
        targetPlan === SubscriptionPlan.PRO)
    ) {
      if (!subscription.stripeSubscriptionId) {
        // No Stripe sub yet — fall back to checkout
        return this.createCheckoutSession(workspace, user, targetPlan);
      }

      const updated = await this.stripe.updateSubscriptionPrice({
        subscriptionId: subscription.stripeSubscriptionId,
        newPriceId: this.stripe.priceIdForPlan(targetPlan),
      });
      // Webhook is source of truth; sync optimistically for snappier UX
      await this.syncSubscriptionFromStripe(updated);

      return {
        action: "subscription_updated" as const,
        plan: targetPlan,
      };
    }

    throw new BadRequestException("Unsupported plan change");
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!signature) {
      throw new BadRequestException("Missing Stripe-Signature header");
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.constructEvent(rawBody, signature);
    } catch (error) {
      this.logger.warn(
        `Webhook signature verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new BadRequestException("Invalid Stripe webhook signature");
    }

    const alreadyProcessed = await this.prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (alreadyProcessed) {
      return { received: true, duplicate: true };
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.onCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.syncSubscriptionFromStripe(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await this.onSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "invoice.payment_failed":
        await this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Ignoring Stripe event type=${event.type}`);
    }

    await this.prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
      },
    });

    return { received: true };
  }

  private async ensureStripeCustomer(
    workspace: WorkspaceContext,
    user: JwtUser,
    subscriptionRowId: string,
    existingCustomerId: string | null,
  ) {
    if (existingCustomerId) return existingCustomerId;

    const customer = await this.stripe.createCustomer({
      email: user.email,
      name: workspace.name,
      workspaceId: workspace.id,
    });

    await this.prisma.subscription.update({
      where: { id: subscriptionRowId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  private async onCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const workspaceId =
      session.metadata?.workspaceId ?? session.client_reference_id;
    if (!workspaceId) {
      this.logger.warn("checkout.session.completed missing workspaceId");
      return;
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      this.logger.warn(
        `checkout.session.completed missing subscription for workspace=${workspaceId}`,
      );
      return;
    }

    const stripeSubscription =
      await this.stripe.retrieveSubscription(subscriptionId);
    await this.syncSubscriptionFromStripe(stripeSubscription, workspaceId);
  }

  private async onSubscriptionDeleted(subscription: Stripe.Subscription) {
    const workspaceId = await this.resolveWorkspaceId(subscription);
    if (!workspaceId) return;

    await this.prisma.subscription.update({
      where: { workspaceId },
      data: {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
        stripePriceId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });
  }

  private async onInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id;
    if (!customerId) return;

    const local = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (!local) return;

    await this.prisma.subscription.update({
      where: { id: local.id },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  }

  private async syncSubscriptionFromStripe(
    stripeSubscription: Stripe.Subscription,
    knownWorkspaceId?: string,
  ) {
    const workspaceId =
      knownWorkspaceId ?? (await this.resolveWorkspaceId(stripeSubscription));
    if (!workspaceId) {
      this.logger.warn(
        `Cannot sync subscription ${stripeSubscription.id}: workspace not found`,
      );
      return;
    }

    const priceId = stripeSubscription.items.data[0]?.price?.id ?? null;
    const plan = this.stripe.planFromPriceId(priceId);
    if (!plan) {
      this.logger.warn(
        `Unknown Stripe price ${priceId} for subscription ${stripeSubscription.id}`,
      );
      return;
    }

    const { currentPeriodStart, currentPeriodEnd } =
      this.extractPeriod(stripeSubscription);

    const customerId =
      typeof stripeSubscription.customer === "string"
        ? stripeSubscription.customer
        : stripeSubscription.customer.id;

    await this.prisma.subscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        plan,
        status: this.mapStripeStatus(stripeSubscription.status),
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      update: {
        plan,
        status: this.mapStripeStatus(stripeSubscription.status),
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });
  }

  private async resolveWorkspaceId(subscription: Stripe.Subscription) {
    const fromMeta = subscription.metadata?.workspaceId;
    if (fromMeta) return fromMeta;

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    const byCustomer = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      select: { workspaceId: true },
    });
    if (byCustomer) return byCustomer.workspaceId;

    const bySub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { workspaceId: true },
    });
    return bySub?.workspaceId ?? null;
  }

  private extractPeriod(subscription: Stripe.Subscription) {
    // Stripe API shapes vary slightly by version — prefer subscription fields,
    // fall back to the first subscription item.
    const raw = subscription as Stripe.Subscription & {
      current_period_start?: number;
      current_period_end?: number;
    };
    const item = subscription.items.data[0] as
      | (Stripe.SubscriptionItem & {
          current_period_start?: number;
          current_period_end?: number;
        })
      | undefined;

    const start =
      raw.current_period_start ?? item?.current_period_start ?? undefined;
    const end = raw.current_period_end ?? item?.current_period_end ?? undefined;

    return {
      currentPeriodStart: start ? new Date(start * 1000) : null,
      currentPeriodEnd: end ? new Date(end * 1000) : null,
    };
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case "active":
        return SubscriptionStatus.ACTIVE;
      case "trialing":
        return SubscriptionStatus.TRIALING;
      case "past_due":
        return SubscriptionStatus.PAST_DUE;
      case "canceled":
        return SubscriptionStatus.CANCELED;
      case "incomplete":
        return SubscriptionStatus.INCOMPLETE;
      case "incomplete_expired":
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      case "unpaid":
        return SubscriptionStatus.UNPAID;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }
}
