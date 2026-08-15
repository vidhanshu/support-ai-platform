# @support-ai/sdk

Support AI SDK for apps that chat with your agents over the **public API**.

## Install

```bash
npm install @support-ai/sdk
```

React UI (optional peer deps):

```bash
npm install @support-ai/sdk react react-dom
```

## Core (no React)

```ts
import { createClient } from "@support-ai/sdk";

const client = createClient({
  agentId: "YOUR_AGENT_ID",
  apiKey: "sak_live_…",
  apiUrl: "https://YOUR_API/v1",
});
```

## React — floating chat bubble (recommended)

Same UX as the website widget: launcher button + panel.

```tsx
import { SupportAIProvider, ChatBubble } from "@support-ai/sdk/react";

export function SupportWidget() {
  return (
    <SupportAIProvider
      agentId="YOUR_AGENT_ID"
      apiKey={process.env.NEXT_PUBLIC_SUPPORT_AI_KEY!}
      apiUrl="https://YOUR_API/v1"
    >
      <ChatBubble position="bottom-right" />
    </SupportAIProvider>
  );
}
```

Put `<SupportWidget />` once in your root layout (e.g. Next.js `app/layout.tsx`) so it floats on every page.

## React — inline panel

For a dedicated `/support` page (not floating):

```tsx
import { SupportAIProvider, ChatPanel } from "@support-ai/sdk/react";

<SupportAIProvider agentId="…" apiKey="…" apiUrl="https://YOUR_API/v1">
  <ChatPanel />
</SupportAIProvider>
```

Custom UI with `useChat()`:

```tsx
import { SupportAIProvider, useChat } from "@support-ai/sdk/react";
```

## Auth

Use an **agent API key** (`sak_live_…` / `sak_test_…`) from the dashboard.  
Add your website origin to the key’s `allowedOrigins`.

## Related

- [`@support-ai/chat-core`](https://www.npmjs.com/package/@support-ai/chat-core) — client only  
- [`@support-ai/widget`](https://www.npmjs.com/package/@support-ai/widget) — script-tag / CDN bubble
