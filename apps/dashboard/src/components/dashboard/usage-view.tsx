"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useBilling } from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import { PLAN_DISPLAY, type PlanId } from "@/lib/billing/plans";

export function UsageView() {
  const { workspaceSlug } = useActiveWorkspace();
  const billingQuery = useBilling();

  if (billingQuery.isLoading || !billingQuery.data) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const billing = billingQuery.data;
  const plan = PLAN_DISPLAY[billing.plan as PlanId];
  const used = billing.usage.chatMessagesThisMonth;
  const limit = billing.limits.chatMessagesPerMonth;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Usage</h1>
          <p className="text-sm text-muted-foreground">
            {plan.name} plan · resets monthly
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link href={`/dashboard/${workspaceSlug}/settings/plans`} />}
        >
          Upgrade plan
        </Button>
      </div>

      <section className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Chat messages</span>
          <span className="tabular-nums text-muted-foreground">
            {used.toLocaleString()} / {limit.toLocaleString()}
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Plan limits</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4 border-b py-2 sm:border-0 sm:py-0">
            <dt className="text-muted-foreground">Agents</dt>
            <dd className="font-medium">{billing.limits.agents}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b py-2 sm:border-0 sm:py-0">
            <dt className="text-muted-foreground">Knowledge sources</dt>
            <dd className="font-medium">{billing.limits.knowledgeSources}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b py-2 sm:border-0 sm:py-0">
            <dt className="text-muted-foreground">Team members</dt>
            <dd className="font-medium">{billing.limits.teamMembers}</dd>
          </div>
          <div className="flex justify-between gap-4 py-2 sm:py-0">
            <dt className="text-muted-foreground">Website sources</dt>
            <dd className="font-medium">
              {billing.limits.websiteSources ? "Included" : "Not included"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
