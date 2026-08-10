"use client";

import { useState } from "react";
import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import {
  useBilling,
  useChangePlan,
  useCheckout,
} from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import type { SubscriptionPlan } from "@/lib/api";
import {
  PLAN_DISPLAY,
  type PlanId,
} from "@/lib/billing/plans";
import { toastApiError, toastSuccess } from "@/lib/toast";

type UpgradePlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
};

function upgradeTargets(current: PlanId): PlanId[] {
  if (current === "FREE") return ["HOBBY", "PRO"];
  if (current === "HOBBY") return ["PRO"];
  return [];
}

export function UpgradePlanDialog({
  open,
  onOpenChange,
  message,
}: UpgradePlanDialogProps) {
  const { workspace } = useActiveWorkspace();
  const billingQuery = useBilling();
  const checkout = useCheckout();
  const changePlan = useChangePlan();
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);

  const canManage =
    workspace?.role === "OWNER" || workspace?.role === "ADMIN";
  const currentPlan = (billingQuery.data?.plan ?? "FREE") as PlanId;
  const targets = upgradeTargets(currentPlan);
  const recommended = targets[0] ?? null;

  async function handleUpgrade(target: PlanId) {
    if (!canManage) return;
    setPendingPlan(target);
    try {
      if (currentPlan === "FREE") {
        const session = await checkout.mutateAsync(target as "HOBBY" | "PRO");
        window.location.href = session.url;
        return;
      }

      const result = await changePlan.mutateAsync(target as SubscriptionPlan);
      if ("url" in result && result.url) {
        window.location.href = result.url;
        return;
      }
      if ("action" in result && result.action === "subscription_updated") {
        toastSuccess(`Upgraded to ${PLAN_DISPLAY[target].name}`);
        onOpenChange(false);
      }
    } catch (error) {
      toastApiError(error, "Unable to start upgrade.");
    } finally {
      setPendingPlan(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <DialogTitle>Upgrade to continue</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Current plan · {PLAN_DISPLAY[currentPlan].name}
          </p>

          {targets.length === 0 ? (
            <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              You’re already on the highest plan. Remove unused resources or
              contact support if you need higher limits.
            </p>
          ) : (
            <div className="space-y-3">
              {targets.map((planId) => {
                const plan = PLAN_DISPLAY[planId];
                const isRecommended = planId === recommended;
                const busy = pendingPlan === planId;

                return (
                  <div
                    key={planId}
                    className={cn(
                      "rounded-xl border p-4",
                      isRecommended && "border-primary ring-1 ring-primary",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          {isRecommended ? (
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Recommended
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plan.price}
                          <span className="text-muted-foreground">
                            {" "}
                            {plan.priceNote}
                          </span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={isRecommended ? "default" : "outline"}
                        disabled={!canManage || Boolean(pendingPlan)}
                        onClick={() => void handleUpgrade(planId)}
                      >
                        {busy ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin" />
                            Working…
                          </>
                        ) : (
                          `Upgrade`
                        )}
                      </Button>
                    </div>

                    <ul className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                      {plan.features.slice(0, 4).map((feature) => (
                        <li
                          key={feature.label}
                          className="flex items-center gap-1.5"
                        >
                          <Check className="size-3.5 shrink-0 text-primary" />
                          <span>
                            {feature.label}:{" "}
                            {typeof feature.value === "boolean"
                              ? feature.value
                                ? "Yes"
                                : "No"
                              : feature.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {!canManage ? (
            <p className="text-sm text-muted-foreground">
              Only workspace owners and admins can change plans. Ask them to
              upgrade.
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
