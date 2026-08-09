import type { Metadata } from "next";
import { Footer } from "@/components/common/footer";
import { Nav } from "@/components/common/nav";
import { Pricing } from "@/components/common/pricing";

export const metadata: Metadata = {
  title: "Pricing — Support AI",
  description:
    "Compare Free, Hobby, and Pro plans for Support AI conversational agents.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-6xl px-6 pt-[calc(68px+3rem)] pb-20 lg:px-12 lg:pb-28">
        <Pricing />
      </section>
      <Footer />
    </main>
  );
}
