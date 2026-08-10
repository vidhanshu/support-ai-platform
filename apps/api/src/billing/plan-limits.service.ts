import { Injectable } from "@nestjs/common";
import {
  PLAN_LIMITS,
  type PlanId,
  type PlanLimits,
} from "@repo/config";
import {
  PrismaService,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@repo/database";
import { PlanLimitReachedException } from "./exceptions/plan-limit.exception";

@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSubscription(workspaceId: string) {
    const existing = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });
    if (existing) return existing;

    return this.prisma.subscription.create({
      data: {
        workspaceId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  async getPlan(workspaceId: string): Promise<SubscriptionPlan> {
    const subscription = await this.getOrCreateSubscription(workspaceId);
    return subscription.plan;
  }

  async getLimits(workspaceId: string): Promise<PlanLimits> {
    const plan = await this.getPlan(workspaceId);
    return PLAN_LIMITS[plan as PlanId];
  }

  async assertCanCreateAgent(workspaceId: string) {
    const [plan, limits, count] = await Promise.all([
      this.getPlan(workspaceId),
      this.getLimits(workspaceId),
      this.prisma.agent.count({ where: { workspaceId } }),
    ]);

    if (count >= limits.agents) {
      throw new PlanLimitReachedException(
        `Your ${plan} plan allows up to ${limits.agents} agents.`,
      );
    }
  }

  async assertCanCreateKnowledgeSource(workspaceId: string) {
    const [plan, limits, count] = await Promise.all([
      this.getPlan(workspaceId),
      this.getLimits(workspaceId),
      this.prisma.knowledgeSource.count({ where: { workspaceId } }),
    ]);

    if (count >= limits.knowledgeSources) {
      throw new PlanLimitReachedException(
        `Your ${plan} plan allows up to ${limits.knowledgeSources} knowledge sources.`,
      );
    }
  }

  async assertCanCreateWebsiteSource(workspaceId: string) {
    await this.assertCanCreateKnowledgeSource(workspaceId);

    const [plan, limits] = await Promise.all([
      this.getPlan(workspaceId),
      this.getLimits(workspaceId),
    ]);

    if (!limits.websiteSources) {
      throw new PlanLimitReachedException(
        `Your ${plan} plan does not include website knowledge sources. Upgrade to Hobby or Pro.`,
      );
    }
  }

  async assertCanAddMember(workspaceId: string) {
    const [plan, limits, memberCount, pendingInvites] = await Promise.all([
      this.getPlan(workspaceId),
      this.getLimits(workspaceId),
      this.prisma.workspaceMember.count({ where: { workspaceId } }),
      this.prisma.workspaceInvitation.count({
        where: { workspaceId, acceptedAt: null },
      }),
    ]);

    if (memberCount + pendingInvites >= limits.teamMembers) {
      throw new PlanLimitReachedException(
        `Your ${plan} plan allows up to ${limits.teamMembers} team members.`,
      );
    }
  }

  currentPeriodStart(date = new Date()) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  async getChatUsage(workspaceId: string) {
    const periodStart = this.currentPeriodStart();
    const usage = await this.prisma.workspaceUsage.findUnique({
      where: {
        workspaceId_periodStart: { workspaceId, periodStart },
      },
    });
    return usage?.chatMessages ?? 0;
  }

  async assertCanSendChatMessage(workspaceId: string) {
    const [plan, limits, used] = await Promise.all([
      this.getPlan(workspaceId),
      this.getLimits(workspaceId),
      this.getChatUsage(workspaceId),
    ]);

    if (used >= limits.chatMessagesPerMonth) {
      throw new PlanLimitReachedException(
        `Your ${plan} plan allows up to ${limits.chatMessagesPerMonth} chat messages per month.`,
      );
    }
  }

  async incrementChatMessages(workspaceId: string, by = 1) {
    const periodStart = this.currentPeriodStart();
    await this.prisma.workspaceUsage.upsert({
      where: {
        workspaceId_periodStart: { workspaceId, periodStart },
      },
      create: {
        workspaceId,
        periodStart,
        chatMessages: by,
      },
      update: {
        chatMessages: { increment: by },
      },
    });
  }
}
