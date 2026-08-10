import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ENV_KEYS } from "@repo/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(
      this.config.getOrThrow<string>(ENV_KEYS.STRIPE_SECRET_KEY),
    );
    this.webhookSecret = this.config.getOrThrow<string>(
      ENV_KEYS.STRIPE_WEBHOOK_SECRET,
    );
  }

  getHobbyPriceId(): string {
    return this.config.getOrThrow<string>(ENV_KEYS.STRIPE_HOBBY_PRICE_ID);
  }

  getProPriceId(): string {
    return this.config.getOrThrow<string>(ENV_KEYS.STRIPE_PRO_PRICE_ID);
  }

  priceIdForPlan(plan: "HOBBY" | "PRO"): string {
    return plan === "HOBBY" ? this.getHobbyPriceId() : this.getProPriceId();
  }

  planFromPriceId(priceId: string | null | undefined): "HOBBY" | "PRO" | null {
    if (!priceId) return null;
    if (priceId === this.getHobbyPriceId()) return "HOBBY";
    if (priceId === this.getProPriceId()) return "PRO";
    return null;
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
  }

  async createCustomer(input: {
    email?: string;
    name: string;
    workspaceId: string;
  }): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email: input.email,
      name: input.name,
      metadata: { workspaceId: input.workspaceId },
    });
  }

  async createCheckoutSession(input: {
    customerId: string;
    priceId: string;
    workspaceId: string;
    plan: "HOBBY" | "PRO";
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: input.customerId,
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.workspaceId,
      metadata: {
        workspaceId: input.workspaceId,
        plan: input.plan,
      },
      subscription_data: {
        metadata: {
          workspaceId: input.workspaceId,
          plan: input.plan,
        },
      },
    });
  }

  async retrieveSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscriptionPrice(input: {
    subscriptionId: string;
    newPriceId: string;
  }): Promise<Stripe.Subscription> {
    const subscription = await this.retrieveSubscription(input.subscriptionId);
    const itemId = subscription.items.data[0]?.id;
    if (!itemId) {
      throw new Error("Stripe subscription has no items");
    }

    return this.stripe.subscriptions.update(input.subscriptionId, {
      items: [{ id: itemId, price: input.newPriceId }],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
    });
  }

  async cancelAtPeriodEnd(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}
