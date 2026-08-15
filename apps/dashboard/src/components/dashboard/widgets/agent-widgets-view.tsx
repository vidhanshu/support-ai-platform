"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { API_BASE_URL } from "@/lib/api";
import { toastSuccess } from "@/lib/toast";

type AgentWidgetsViewProps = {
  agentId: string;
};

async function copyText(label: string, value: string) {
  await navigator.clipboard.writeText(value);
  toastSuccess(`${label} copied`);
}

export function AgentWidgetsView({ agentId }: AgentWidgetsViewProps) {
  const [apiKeyPlaceholder, setApiKeyPlaceholder] = useState("sak_live_YOUR_KEY");
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const widgetSrc = `${origin}/embed/widget.js`;

  const scriptSnippet = useMemo(
    () => `<script
  src="${widgetSrc}"
  data-agent-id="${agentId}"
  data-api-key="${apiKeyPlaceholder}"
  data-api-url="${API_BASE_URL}"
  data-primary-color="#111111"
  async
></script>`,
    [agentId, apiKeyPlaceholder, widgetSrc],
  );

  const initSnippet = useMemo(
    () => `<script src="${widgetSrc}"></script>
<script>
  SupportAI.init({
    agentId: "${agentId}",
    apiKey: "${apiKeyPlaceholder}",
    apiUrl: "${API_BASE_URL}",
    primaryColor: "#111111",
    greeting: "Hi! How can we help?",
  });
</script>`,
    [agentId, apiKeyPlaceholder, widgetSrc],
  );

  const sdkSnippet = useMemo(
    () => `import { SupportAIProvider, ChatPanel } from "@support-ai/sdk/react";

export function Help() {
  return (
    <SupportAIProvider
      agentId="${agentId}"
      apiKey={process.env.NEXT_PUBLIC_SUPPORT_AI_KEY!}
      apiUrl="${API_BASE_URL}"
    >
      <ChatPanel />
    </SupportAIProvider>
  );
}`,
    [agentId],
  );

  const cdnSnippet = useMemo(
    () => `<script
  src="https://cdn.jsdelivr.net/npm/@support-ai/widget@0.1.0/dist/widget.js"
  data-agent-id="${agentId}"
  data-api-key="${apiKeyPlaceholder}"
  data-api-url="${API_BASE_URL}"
  async
></script>`,
    [agentId, apiKeyPlaceholder],
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Widgets</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Embed the floating chat bubble on any website, or install the React SDK
          in your app. Both talk to the same public API — create a key under{" "}
          <span className="font-medium text-foreground">API keys</span> first and
          add your site origin to <code className="text-xs">allowedOrigins</code>.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">API key for snippets</h2>
        <p className="text-sm text-muted-foreground">
          Paste the secret you copied when creating a key (shown once). Do not
          commit production keys to git.
        </p>
        <Input
          value={apiKeyPlaceholder}
          onChange={(e) => setApiKeyPlaceholder(e.target.value)}
          placeholder="sak_live_…"
          className="font-mono text-sm"
        />
      </section>

      <SnippetBlock
        title="1. Script tag (auto-init)"
        description="Paste before </body> on your marketing site. Local/dev uses this dashboard’s /embed/widget.js; after npm publish prefer the jsDelivr snippet below."
        code={scriptSnippet}
        onCopy={() => void copyText("Script snippet", scriptSnippet)}
      />

      <SnippetBlock
        title="2. SupportAI.init()"
        description="Same widget, explicit config — useful when you want to open/close it from your own buttons."
        code={initSnippet}
        onCopy={() => void copyText("Init snippet", initSnippet)}
      />

      <SnippetBlock
        title="3. CDN (npm @support-ai/widget)"
        description="After publishing, sites can load the widget from jsDelivr without hosting the file yourself."
        code={cdnSnippet}
        onCopy={() => void copyText("CDN snippet", cdnSnippet)}
      />

      <SnippetBlock
        title="4. React SDK"
        description="npm install @support-ai/sdk — SupportAIProvider + ChatPanel (or useChat for a custom UI)."
        code={sdkSnippet}
        onCopy={() => void copyText("SDK snippet", sdkSnippet)}
      />

      <section className="rounded-xl border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Local widget build</p>
        <p className="mt-1">
          <code className="text-xs">pnpm --filter @support-ai/widget build</code>{" "}
          writes <code className="text-xs">widget.js</code> and copies it to{" "}
          <code className="text-xs">apps/dashboard/public/embed/widget.js</code>.
        </p>
      </section>
    </div>
  );
}

function SnippetBlock({
  title,
  description,
  code,
  onCopy,
}: {
  title: string;
  description: string;
  code: string;
  onCopy: () => void;
}) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <Copy className="size-3.5" />
          Copy
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </section>
  );
}
