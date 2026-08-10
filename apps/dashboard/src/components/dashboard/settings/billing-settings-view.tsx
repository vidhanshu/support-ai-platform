"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useBilling } from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import { formatShortDate } from "@/lib/format";
import { PLAN_DISPLAY, type PlanId } from "@/lib/billing/plans";
import { toastSuccess } from "@/lib/toast";

function usagePercent(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function BillingSettingsView() {
  const searchParams = useSearchParams();
  const { workspaceSlug } = useActiveWorkspace();
  const billingQuery = useBilling();

  useEffect(() => {
    if (searchParams.get("billing") === "success") {
      toastSuccess("Payment received. Your plan will update shortly.");
      void billingQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (billingQuery.isLoading || !billingQuery.data) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const billing = billingQuery.data;
  const planId = billing.plan as PlanId;
  const plan = PLAN_DISPLAY[planId];
  const chatUsed = billing.usage.chatMessagesThisMonth;
  const chatLimit = billing.limits.chatMessagesPerMonth;
  const chatPct = usagePercent(chatUsed, chatLimit);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Subscription status and usage for this workspace.
        </p>
      </div>

      <section className="rounded-xl border bg-card">
        <div className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Subscription</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-medium">{plan.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">
                {String(billing.status).toLowerCase().replaceAll("_", " ")}
              </dd>
            </div>
            {billing.subscription?.currentPeriodEnd ? (
              <div>
                <dt className="text-muted-foreground">
                  {billing.subscription.cancelAtPeriodEnd
                    ? "Access until"
                    : "Renews"}
                </dt>
                <dd className="font-medium">
                  {formatShortDate(billing.subscription.currentPeriodEnd)}
                </dd>
              </div>
            ) : null}
            {billing.subscription?.cancelAtPeriodEnd ? (
              <div>
                <dt className="text-muted-foreground">Cancellation</dt>
                <dd className="font-medium">Scheduled at period end</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="flex justify-end border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/dashboard/${workspaceSlug}/settings/plans`} />
            }
          >
            Manage plan
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Usage this month</h2>
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Chat messages</span>
            <span className="tabular-nums font-medium">
              {chatUsed.toLocaleString()} / {chatLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${chatPct}%` }}
            />
          </div>
        </div>

        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>
            Agents limit:{" "}
            <span className="font-medium text-foreground">
              {billing.limits.agents}
            </span>
          </li>
          <li>
            Knowledge sources:{" "}
            <span className="font-medium text-foreground">
              {billing.limits.knowledgeSources}
            </span>
          </li>
          <li>
            Team members:{" "}
            <span className="font-medium text-foreground">
              {billing.limits.teamMembers}
            </span>
          </li>
          <li>
            Website sources:{" "}
            <span className="font-medium text-foreground">
              {billing.limits.websiteSources ? "Yes" : "No"}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
