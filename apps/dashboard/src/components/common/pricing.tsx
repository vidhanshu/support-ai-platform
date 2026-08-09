import Link from "next/link";
import { Check, X } from "lucide-react";
import { Lobster_Two } from "next/font/google";
import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

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

type FeatureValue = boolean | string;

type Plan = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  cta: string;
  href: string;
  highlighted?: boolean;
  features: {
    label: string;
    value: FeatureValue;
  }[];
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    priceNote: "Forever free",
    description: "Try Support AI with a single agent and light usage.",
    cta: "Get started",
    href: "/auth?mode=signup",
    features: [
      { label: "Agents", value: "1" },
      { label: "Knowledge sources", value: "3" },
      { label: "Chat messages/month", value: "100" },
      { label: "Website sources", value: false },
      { label: "Team members", value: "1" },
      { label: "Usage analytics", value: false },
    ],
  },
  {
    id: "hobby",
    name: "Hobby",
    price: "₹499",
    priceNote: "per month",
    description: "For solo builders and small projects going live.",
    cta: "Start Hobby",
    href: "/auth?mode=signup",
    highlighted: true,
    features: [
      { label: "Agents", value: "3" },
      { label: "Knowledge sources", value: "15" },
      { label: "Chat messages/month", value: "2,000" },
      { label: "Website sources", value: true },
      { label: "Team members", value: "3" },
      { label: "Usage analytics", value: "Basic" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹1,499",
    priceNote: "per month",
    description: "For growing teams that need scale and deeper insight.",
    cta: "Start Pro",
    href: "/auth?mode=signup",
    features: [
      { label: "Agents", value: "10" },
      { label: "Knowledge sources", value: "100" },
      { label: "Chat messages/month", value: "20,000" },
      { label: "Website sources", value: true },
      { label: "Team members", value: "10" },
      { label: "Usage analytics", value: "Advanced" },
    ],
  },
];

function FeatureValueDisplay({ value }: { value: FeatureValue }) {
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

type PricingProps = {
  className?: string;
  showHeader?: boolean;
};

export function Pricing({ className, showHeader = true }: PricingProps) {
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
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-background p-6 sm:p-8",
              plan.highlighted && "border-primary ring-1 ring-primary lg:-translate-y-2",
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
              href={plan.href}
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: plan.highlighted ? "default" : "outline",
                }),
                "mt-6 w-full",
              )}
            >
              {plan.cta}
            </Link>

            <ul className="mt-8 flex flex-1 flex-col gap-3 border-t pt-6">
              {plan.features.map((feature) => (
                <li
                  key={feature.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-muted-foreground">{feature.label}</span>
                  <FeatureValueDisplay value={feature.value} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

export { plans as pricingPlans };
