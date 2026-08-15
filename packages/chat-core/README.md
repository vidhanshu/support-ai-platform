# @support-ai/chat-core

Framework-agnostic client for the Support AI **public chat API**.

## Install

```bash
npm install @support-ai/chat-core
```

## Usage

```ts
import { createClient } from "@support-ai/chat-core";

const client = createClient({
  agentId: "YOUR_AGENT_ID",
  apiKey: "sak_live_…",
  apiUrl: "https://YOUR_API/v1",
});

const agent = await client.getAgent();

await client.chat({
  message: "Hello",
  conversationId: null,
  onEvent: (event) => {
    if (event.type === "token") process.stdout.write(event.data.content);
  },
});
```

Create an agent API key in the dashboard and add your site origin to `allowedOrigins`.

For React UI, use [`@support-ai/sdk`](https://www.npmjs.com/package/@support-ai/sdk).  
For a script-tag embed, use [`@support-ai/widget`](https://www.npmjs.com/package/@support-ai/widget).
