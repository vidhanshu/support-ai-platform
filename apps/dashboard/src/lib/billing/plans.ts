/** Display metadata for plans — keep limits aligned with API PLAN_LIMITS. */
export type PlanId = "FREE" | "HOBBY" | "PRO";

export const PLAN_DISPLAY: Record<
  PlanId,
  {
    name: string;
    price: string;
    priceNote: string;
    description: string;
    highlighted?: boolean;
    features: { label: string; value: string | boolean }[];
  }
> = {
  FREE: {
    name: "Free",
    price: "₹0",
    priceNote: "Forever free",
    description: "Try Support AI with a single agent and light usage.",
    features: [
      { label: "Agents", value: "1" },
      { label: "Knowledge sources", value: "3" },
      { label: "Chat messages/month", value: "100" },
      { label: "Website sources", value: false },
      { label: "Team members", value: "1" },
      { label: "Usage analytics", value: false },
    ],
  },
  HOBBY: {
    name: "Hobby",
    price: "₹499",
    priceNote: "per month",
    description: "For solo builders and small projects going live.",
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
  PRO: {
    name: "Pro",
    price: "₹1,499",
    priceNote: "per month",
    description: "For growing teams that need scale and deeper insight.",
    features: [
      { label: "Agents", value: "10" },
      { label: "Knowledge sources", value: "100" },
      { label: "Chat messages/month", value: "20,000" },
      { label: "Website sources", value: true },
      { label: "Team members", value: "10" },
      { label: "Usage analytics", value: "Advanced" },
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["FREE", "HOBBY", "PRO"];

export function planRank(plan: PlanId) {
  return PLAN_ORDER.indexOf(plan);
}
