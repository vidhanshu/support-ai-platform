"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, LoaderCircle, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useBilling,
  useChangePlan,
  useCheckout,
} from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import type { SubscriptionPlan } from "@/lib/api";
import {
  PLAN_DISPLAY,
  PLAN_ORDER,
  planRank,
  type PlanId,
} from "@/lib/billing/plans";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { toast } from "sonner";

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Check className="size-4 text-primary" />
        Included
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <X className="size-4" />
        Not included
      </span>
    );
  }
  return <span className="font-medium">{value}</span>;
}

function ctaLabel(current: PlanId, target: PlanId) {
  if (current === target) return "Current plan";
  if (target === "FREE") return "Downgrade to Free";
  if (planRank(target) > planRank(current)) return `Upgrade to ${PLAN_DISPLAY[target].name}`;
  return `Switch to ${PLAN_DISPLAY[target].name}`;
}

export function PlansSettingsView() {
  const searchParams = useSearchParams();
  const { workspace } = useActiveWorkspace();
  const billingQuery = useBilling();
  const checkout = useCheckout();
  const changePlan = useChangePlan();
  const { confirm, confirmationDialog } = useConfirmDialog();
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);

  const canManage =
    workspace?.role === "OWNER" || workspace?.role === "ADMIN";
  const currentPlan = (billingQuery.data?.plan ?? "FREE") as PlanId;
  const cancelAtPeriodEnd =
    billingQuery.data?.subscription?.cancelAtPeriodEnd ?? false;

  useEffect(() => {
    if (searchParams.get("billing") === "cancel") {
      toast.message("Checkout cancelled — no changes were made.");
    }
  }, [searchParams]);

  async function handleSelect(target: PlanId) {
    if (!canManage || target === currentPlan) return;

    if (target === "FREE") {
      const ok = await confirm({
        title: "Downgrade to Free?",
        description:
          "Your paid subscription will cancel at the end of the current billing period. You’ll keep paid features until then.",
        confirmLabel: "Schedule downgrade",
        variant: "destructive",
        action: async () => {
          setPendingPlan("FREE");
          try {
            const result = await changePlan.mutateAsync("FREE");
            if ("action" in result && result.action === "cancel_at_period_end") {
              toastSuccess(
                "Downgrade scheduled — you’ll move to Free at period end.",
              );
            }
          } finally {
            setPendingPlan(null);
          }
        },
      });
      if (!ok) return;
      return;
    }

    setPendingPlan(target);
    try {
      if (currentPlan === "FREE") {
        const session = await checkout.mutateAsync(target);
        window.location.href = session.url;
        return;
      }

      const result = await changePlan.mutateAsync(target as SubscriptionPlan);
      if ("url" in result && result.url) {
        window.location.href = result.url;
        return;
      }
      if ("action" in result && result.action === "subscription_updated") {
        toastSuccess(`Plan updated to ${PLAN_DISPLAY[target].name}`);
      }
    } catch (error) {
      toastApiError(error, "Unable to change plan.");
    } finally {
      setPendingPlan(null);
    }
  }

  if (billingQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <Skeleton className="h-9 w-40" />
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Plans</h1>
        <p className="text-sm text-muted-foreground">
          Current plan:{" "}
          <span className="font-medium text-foreground">
            {PLAN_DISPLAY[currentPlan].name}
          </span>
          {cancelAtPeriodEnd
            ? " · Cancels at end of billing period"
            : null}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLAN_DISPLAY[planId];
          const isCurrent = planId === currentPlan;
          const busy = pendingPlan === planId;

          return (
            <article
              key={planId}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6",
                plan.highlighted && "border-primary ring-1 ring-primary",
                isCurrent && "bg-muted/30",
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              ) : null}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  {isCurrent ? (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.priceNote}
                </span>
              </div>

              <Button
                type="button"
                className="mt-6 w-full"
                variant={isCurrent ? "outline" : plan.highlighted ? "default" : "outline"}
                disabled={!canManage || isCurrent || Boolean(pendingPlan)}
                onClick={() => void handleSelect(planId)}
              >
                {busy ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Working…
                  </>
                ) : (
                  ctaLabel(currentPlan, planId)
                )}
              </Button>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t pt-5">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {feature.label}
                    </span>
                    <FeatureValue value={feature.value} />
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {!canManage ? (
        <p className="text-sm text-muted-foreground">
          Only workspace owners and admins can change plans.
        </p>
      ) : null}

      {confirmationDialog}
    </div>
  );
}
