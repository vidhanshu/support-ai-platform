import { apiClient } from "./client";
import type {
  BillingStatus,
  ChangePlanResponse,
  CheckoutSessionResponse,
  SubscriptionPlan,
} from "./types";

export type CheckoutPlan = Exclude<SubscriptionPlan, "FREE">;

export const billingApi = {
  get: () => apiClient.get<BillingStatus>("/billing", { workspace: true }),

  checkout: (plan: CheckoutPlan) =>
    apiClient.post<CheckoutSessionResponse>(
      "/billing/checkout",
      { plan },
      { workspace: true },
    ),

  changePlan: (plan: SubscriptionPlan) =>
    apiClient.post<ChangePlanResponse>(
      "/billing/change-plan",
      { plan },
      { workspace: true },
    ),
};
