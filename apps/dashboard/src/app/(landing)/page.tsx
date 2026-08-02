import Link from "next/link";
import Image from "next/image";
import { Lobster_Two } from "next/font/google";
import {
  FileText,
  Globe,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Nav } from "@/components/common/nav";
import { Footer } from "@/components/common/footer";
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

const agents = [
  {
    title: "Support agent",
    body: "Resolve complex tickets across chat and email with answers grounded in your docs.",
  },
  {
    title: "Sales agent",
    body: "Qualify leads, answer product questions, and keep prospects moving toward a demo.",
  },
  {
    title: "Product agent",
    body: "Guide users through features with an on-brand voice and clear next steps.",
  },
] as const;

const steps = [
  {
    step: "01",
    title: "Connect knowledge",
    body: "Upload PDFs, crawl your site, or attach existing sources. We chunk and index everything.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Shape the agent",
    body: "Set tone, guardrails, and which knowledge each agent can use — no code required.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Go live",
    body: "Embed on your site or run from the dashboard. Same agent, every channel.",
    icon: Zap,
  },
] as const;

const features = [
  {
    title: "Cited answers",
    body: "Every reply can point back to the page, doc, or URL it used — so your team trusts it.",
    icon: ShieldCheck,
  },
  {
    title: "Website + docs",
    body: "Train on files and live site content together. One knowledge layer for every agent.",
    icon: Globe,
  },
  {
    title: "Conversation-ready",
    body: "Built for real support threads: context, follow-ups, and clear handoff when needed.",
    icon: MessageSquare,
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="mx-auto grid min-h-[calc(100vh-68px)] max-w-6xl items-center lg:grid-cols-5 mt-[68px]">
        <div className="col-span-3 flex flex-col gap-y-6 px-6 py-12 lg:px-12 lg:py-8">
          <h1 className="text-5xl font-medium tracking-tight sm:text-6xl lg:text-7xl">
            Conversational <Accent>agents</Accent> for{" "}
            <Accent>customer</Accent> experience
          </h1>
          <p className="max-w-xl text-lg font-bold text-muted-foreground">
            AI agents that meet customers at every stage of their journey,
            across chat, email, and voice, to resolve issues end to end and
            increase revenue.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/auth"
              className={cn(buttonVariants({ size: "2xl" }))}
            >
              Start free trial
            </Link>
            <Link
              href="/auth"
              className={cn(buttonVariants({ size: "2xl", variant: "outline" }))}
            >
              Get a demo
            </Link>
          </div>
        </div>

        <div className="relative col-span-2 mx-auto h-[320px] w-full max-w-md px-6 sm:h-[420px] lg:mx-0 lg:h-full lg:min-h-[520px] lg:max-w-none lg:px-0">
          <Image
            src="/hero.svg"
            alt="Support AI conversational agent"
            fill
            priority
            className="object-contain object-center"
          />
        </div>
      </section>

      {/* Agents */}
      <section id="solutions" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12 lg:py-28">
          <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
            One platform for every <Accent>customer</Accent> interaction
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-bold text-muted-foreground">
            Run support, sales, and product guidance 24/7 — trained on the
            knowledge you already have.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.title} className="flex flex-col gap-y-3">
                <h3 className="text-2xl font-medium">
                  <Accent>{agent.title.split(" ")[0]}</Accent>{" "}
                  {agent.title.split(" ").slice(1).join(" ")}
                </h3>
                <p className="text-base font-bold text-muted-foreground">
                  {agent.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 lg:px-12 lg:py-28">
        <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
          From knowledge to <Accent>live</Accent> agent in minutes
        </h2>
        <p className="mt-4 max-w-2xl text-lg font-bold text-muted-foreground">
          No sprawling setup. Connect sources, define the role, deploy.
        </p>

        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map(({ step, title, body, icon: Icon }) => (
            <li key={step} className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-3">
                <span className="flex size-11 items-center justify-center rounded-lg border border-border">
                  <Icon className="size-5 text-primary" />
                </span>
                <span className="text-sm font-bold tracking-widest text-primary">
                  {step}
                </span>
              </div>
              <h3 className="text-2xl font-medium">{title}</h3>
              <p className="text-base font-bold text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12 lg:py-28">
          <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
            Built for teams who need <Accent>accurate</Accent> answers
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-bold text-muted-foreground">
            Retrieval, citations, and workspace controls — not a generic chatbot
            bolted on.
          </p>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {features.map(({ title, body, icon: Icon }) => (
              <div key={title} className="flex flex-col gap-y-4">
                <span className="flex size-11 items-center justify-center rounded-lg border border-border bg-background">
                  <Icon className="size-5 text-primary" />
                </span>
                <h3 className="text-2xl font-medium">{title}</h3>
                <p className="text-base font-bold text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-12 lg:py-28">
        <div className="flex flex-col items-start gap-y-6 lg:flex-row lg:items-end lg:justify-between lg:gap-x-12">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
              Ready to ship your first <Accent>agent</Accent>?
            </h2>
            <p className="text-lg font-bold text-muted-foreground">
              Create a workspace, connect knowledge, and start answering
              customers today.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/auth"
              className={cn(buttonVariants({ size: "2xl" }))}
            >
              Start free trial
            </Link>
            <Link
              href="/auth"
              className={cn(buttonVariants({ size: "2xl", variant: "outline" }))}
            >
              Get a demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
