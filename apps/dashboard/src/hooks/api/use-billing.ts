"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  billingApi,
  queryKeys,
  type CheckoutPlan,
  type SubscriptionPlan,
} from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";

export function useBilling() {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.billing.status(workspaceId ?? "none"),
    queryFn: () => billingApi.get(),
    enabled: isReady,
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: (plan: CheckoutPlan) => billingApi.checkout(plan),
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (plan: SubscriptionPlan) => billingApi.changePlan(plan),
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.billing.all(workspaceId),
      });
    },
  });
}
