# @support-ai/widget

Floating chat bubble you can drop on any website. Talks to the Support AI **public chat API**.

## CDN (recommended for marketing sites)

```html
<script
  src="https://cdn.jsdelivr.net/npm/@support-ai/widget@0.1.0/dist/widget.js"
  data-agent-id="YOUR_AGENT_ID"
  data-api-key="sak_live_…"
  data-api-url="https://YOUR_API/v1"
  async
></script>
```

Or init manually:

```html
<script src="https://cdn.jsdelivr.net/npm/@support-ai/widget@0.1.0/dist/widget.js"></script>
<script>
  SupportAI.init({
    agentId: "YOUR_AGENT_ID",
    apiKey: "sak_live_…",
    apiUrl: "https://YOUR_API/v1",
  });
</script>
```

## npm

```bash
npm install @support-ai/widget
```

Then serve `node_modules/@support-ai/widget/dist/widget.js` from your app/CDN, or import the ESM build if you bundle it.

## Config

| Option | Description |
|---|---|
| `agentId` | Agent UUID |
| `apiKey` | Public agent key (`sak_…`) |
| `apiUrl` | API base including `/v1` |
| `primaryColor` | Accent (default black `#111111`) |
| `title` | Optional header override (agent name used by default) |
| `greeting` | First system line |
| `position` | `bottom-right` \| `bottom-left` |

Add your page origin to the key’s `allowedOrigins` in the dashboard.

## Related

- [`@support-ai/sdk`](https://www.npmjs.com/package/@support-ai/sdk) — React SDK  
- [`@support-ai/chat-core`](https://www.npmjs.com/package/@support-ai/chat-core) — headless client
