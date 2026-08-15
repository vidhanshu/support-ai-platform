# Support AI Platform

Production-grade, AI-powered customer support platform (educational / architecture-first).

See [CONTEXT.md](./CONTEXT.md) for architecture decisions and roadmap.

## Prerequisites

- Node.js 22+ (for local dashboard / scripts)
- pnpm 9+
- Docker + Docker Compose

## Quick start (recommended)

Bring up **infra + API + worker** with one command (dashboard stays on the host or Vercel):

```bash
cp .env.example .env   # first time only — edit secrets
docker compose up -d --build
```

First run pulls Ollama models (`nomic-embed-text`, `qwen2.5:3b`). With `LLM_PROVIDER=groq`, cloud models use Groq and `qwen2.5:3b` still runs on Ollama.

| Service | URL |
|---|---|
| API | http://localhost:3001/v1/health |
| Worker | http://localhost:3002/health (if exposed) |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6379` |
| MinIO API | http://localhost:9000 |
| MinIO console | http://localhost:9001 |
| Ollama | http://localhost:11434 |

Run the dashboard locally against the compose stack:

```bash
pnpm install
pnpm --filter @repo/dashboard dev
```

Open http://localhost:3000 — `NEXT_PUBLIC_API_URL` should point at `http://localhost:3001/v1`.

### Docker notes

- Compose overrides DB/Redis/MinIO/Ollama hosts to Docker DNS (`postgres`, `redis`, …).
- `MINIO_PUBLIC_ENDPOINT_URL` is what browsers use for signed uploads/downloads (default `http://localhost:9000`). On EC2 set it to `http://YOUR_PUBLIC_IP:9000`.
- API runs `prisma migrate deploy` on startup.
- Dashboard is **not** containerized (deploy on Vercel).

### Infra-only (old workflow)

If you only want databases and still run Nest via `pnpm dev`:

```bash
docker compose up -d postgres redis minio ollama minio-init ollama-init
pnpm install
pnpm db:migrate
pnpm dev
```

## Workspace scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint the workspace |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:studio` | Open Prisma Studio |

## Structure

```
apps/api          NestJS HTTP API (Docker)
apps/worker       NestJS background worker (Docker)
apps/dashboard    Next.js dashboard (Vercel / local)
packages/chat-*   @support-ai/* public chat client + widget
packages/sdk      @support-ai/sdk (+ React)
packages/*        Shared libraries (built into api/worker images)
```

## Public Chat API (website embed)

Per-agent API keys power a public chat surface for the future website SDK. Create keys under **API keys** in the agent sidebar (not under Build → Widgets).

### Auth

```http
Authorization: Bearer sak_live_…   # or sak_test_…
# or
X-Api-Key: sak_live_…
```

Keys are shown **once** at creation. Only a hash is stored. Each key has `allowedOrigins` (required); browser calls must send a matching `Origin`.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/public/agents/:agentId` | Bootstrap: `id`, `name`, `description` |
| `POST` | `/v1/public/agents/:agentId/chat` | SSE chat stream (same event shape as dashboard chat) |

Chat body:

```json
{ "message": "Hello", "conversationId": "<optional uuid>" }
```

SSE events: `status`, `retrieval`, `meta`, `token`, `done`, `error` (JSON in `data:` lines).

### Limits & errors

| Code | When |
|------|------|
| `401` | Missing / invalid / revoked key, or key not for this agent |
| `403` | Agent inactive, or `Origin` not in key’s `allowedOrigins` |
| `429` | Per-key RPM exceeded (`Retry-After` header; body `code: RATE_LIMIT_EXCEEDED`) |
| `400` | Plan chat quota / no ready knowledge sources / inactive agent |

Monthly chat quotas still come from the workspace plan (FREE / HOBBY / PRO).

## Chat widget & SDK (npm)

Public packages (scope `@support-ai`):

| Package | Role |
|---|---|
| `@support-ai/chat-core` | Framework-agnostic client (`createClient`, SSE) |
| `@support-ai/widget` | CDN / script embed (`SupportAI.init`) |
| `@support-ai/sdk` | App SDK; React via `@support-ai/sdk/react` |

### Publish (maintainers)

1. Create the npm org/user that owns `@support-ai` (or change the scope in each package).
2. `npm login`
3. From the repo root:

```bash
pnpm publish:packages
```

That builds and publishes in order: `chat-core` → `sdk` → `widget`.  
`workspace:*` deps are rewritten to real versions by pnpm on publish.

Dry-run first:

```bash
pnpm --filter @support-ai/chat-core --filter @support-ai/sdk --filter @support-ai/widget exec npm pack --dry-run
```

### Widget (any website)

```bash
pnpm --filter @support-ai/widget build
# → packages/chat-widget/dist/widget.js
# → apps/dashboard/public/embed/widget.js
```

```html
<script
  src="https://cdn.jsdelivr.net/npm/@support-ai/widget@0.1.0/dist/widget.js"
  data-agent-id="AGENT_UUID"
  data-api-key="sak_live_…"
  data-api-url="https://YOUR_API/v1"
  async
></script>
```

Copy-ready snippets live under **Build → Widgets** in the dashboard.

### React SDK (in-app)

```bash
npm install @support-ai/sdk
```

```tsx
import { SupportAIProvider, ChatBubble } from "@support-ai/sdk/react";

<SupportAIProvider agentId="…" apiKey="…" apiUrl="https://YOUR_API/v1">
  <ChatBubble position="bottom-right" />
</SupportAIProvider>
```

Mount once in your app root/layout for a site-wide floating bubble. Use `ChatPanel` only when you want an inline chat page.

`useChat()` is available for a fully custom UI. Core-only (no React): `import { createClient } from "@support-ai/sdk"`.
