"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Lobster_Two } from "next/font/google";
import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { useMe } from "@/hooks/api";
import {
  PLAN_DISPLAY,
  PLAN_ORDER,
  type PlanId,
} from "@/lib/billing/plans";

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lobster-two",
});

function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className={cn(lobsterTwo.className, "font-bold text-primary")}>
      {children}
    </span>
  );
}

function FeatureValueDisplay({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <Check className="size-4 text-primary" aria-hidden />
        Included
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <X className="size-4" aria-hidden />
        Not included
      </span>
    );
  }

  return <span className="font-medium text-foreground">{value}</span>;
}

const CTA: Record<PlanId, string> = {
  FREE: "Get started",
  HOBBY: "Start Hobby",
  PRO: "Start Pro",
};

type PricingProps = {
  className?: string;
  showHeader?: boolean;
};

export function Pricing({ className, showHeader = true }: PricingProps) {
  const me = useMe();
  const isAuthenticated = Boolean(me.data?.id);

  function hrefFor(planId: PlanId) {
    if (isAuthenticated) return "/dashboard";
    if (planId === "FREE") return "/auth?mode=signup";
    return `/auth?mode=signup&next=${encodeURIComponent("/dashboard")}`;
  }

  return (
    <div className={cn("w-full", className)}>
      {showHeader ? (
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
            Simple <Accent>pricing</Accent> that scales with you
          </h1>
          <p className="mt-4 text-lg font-bold text-muted-foreground">
            Start free. Upgrade when you need more agents, sources, and
            messages.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-6 lg:grid-cols-3",
          showHeader ? "mt-12 sm:mt-16" : null,
        )}
      >
        {PLAN_ORDER.map((planId) => {
          const plan = PLAN_DISPLAY[planId];
          return (
            <article
              key={planId}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-background p-6 sm:p-8",
                plan.highlighted &&
                  "border-primary ring-1 ring-primary lg:-translate-y-2",
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              ) : null}

              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="text-sm font-medium text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {plan.priceNote}
                </span>
              </div>

              <Link
                href={hrefFor(planId)}
                className={cn(
                  buttonVariants({
                    size: "lg",
                    variant: plan.highlighted ? "default" : "outline",
                  }),
                  "mt-6 w-full",
                )}
              >
                {isAuthenticated ? "Go to dashboard" : CTA[planId]}
              </Link>

              <ul className="mt-8 flex flex-1 flex-col gap-3 border-t pt-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {feature.label}
                    </span>
                    <FeatureValueDisplay value={feature.value} />
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export { PLAN_DISPLAY as pricingPlans };
