import type { SubscriptionPlan } from "@repo/database";

export type PaidPlan = Extract<SubscriptionPlan, "HOBBY" | "PRO">;

export type BillingStatusResponse = {
  plan: SubscriptionPlan;
  status: string;
  limits: {
    agents: number;
    knowledgeSources: number;
    chatMessagesPerMonth: number;
    websiteSources: boolean;
    teamMembers: number;
  };
  usage: {
    chatMessagesThisMonth: number;
  };
  subscription: {
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
};

export type CheckoutSessionResponse = {
  url: string;
};
