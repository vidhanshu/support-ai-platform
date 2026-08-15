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

## React

```tsx
import { SupportAIProvider, ChatPanel } from "@support-ai/sdk/react";

export function Help() {
  return (
    <SupportAIProvider
      agentId="YOUR_AGENT_ID"
      apiKey={process.env.NEXT_PUBLIC_SUPPORT_AI_KEY!}
      apiUrl="https://YOUR_API/v1"
    >
      <ChatPanel />
    </SupportAIProvider>
  );
}
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
