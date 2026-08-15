# Support AI Platform — Architecture Context

This document is the source of truth for architectural decisions.
If code conflicts with this file, update the code or propose a CONTEXT change first.

## Product

Production-grade, AI-powered customer support platform.
Primary goal: educational — scalable architecture and industry best practices over speed.

## Monorepo

- **Tooling:** Turborepo + pnpm workspaces
- **Package manager:** pnpm (`workspace:*` protocol)
- **Communication:** package `exports`, not TypeScript path aliases across packages

```
apps/
  api          NestJS HTTP API
  worker       NestJS background worker (HTTP health for now)
  dashboard    Next.js App Router admin UI
packages/
  database     NestJS library — PrismaModule / PrismaService
  contracts    Shared Zod schemas / DTO contracts
  config       Root env path helpers + env key constants
  utils        Shared pure utilities
  ui           Shared React UI (shadcn-style)
  chat-core    Public chat HTTP + SSE client
  chat-widget  Embeddable Shadow DOM widget (`SupportAI.init` / CDN)
  sdk          npm-style SDK (`@repo/sdk`, React via `@repo/sdk/react`)
  tsconfig     Shared TypeScript configs
  eslint-config Shared ESLint configs
```

Widget ships as `packages/chat-widget` (not `apps/widget`). Built asset is copied to `apps/dashboard/public/embed/widget.js`.

## Services

| App | Role |
|---|---|
| `api` | Public HTTP API. Feature modules live under `src/modules`. |
| `worker` | Background jobs (BullMQ later). Independent Nest app — not a library of `api`. |
| `dashboard` | Operator UI for workspaces, agents, documents, conversations. |

Both `api` and `worker` import `@repo/database`. They never instantiate `PrismaClient` directly.

## Database

- **Engine:** PostgreSQL
- **ORM:** Prisma 7.x
- **Exactly one schema:** `packages/database/prisma/schema.prisma`
- **Exactly one migrations folder:** `packages/database/prisma/migrations`
- **Config:** `packages/database/prisma.config.ts` loads the **root** `.env` via `dotenv.config({ path })`

### `@repo/database`

- NestJS **library** (not an application)
- Exports: `PrismaModule`, `PrismaService`
- `PrismaService` extends generated `PrismaClient`, uses `@prisma/adapter-pg`, implements `OnModuleInit` / `OnModuleDestroy`
- `PrismaModule` is `@Global()`, provides and exports `PrismaService`
- Only `PrismaService` constructs `PrismaClient`

### Multi-tenancy model

```
Workspace
  ├── Members (User via WorkspaceMember)
  ├── Agents
  ├── Documents
  └── Conversations (belong to Agent; scoped to Workspace)

Agents ↔ Documents (M2M via AgentDocument)
Conversation → Messages
```

Current workspace (future auth phase) is determined from the `X-Workspace-Id` header.

## Environment

- **One** `.env` at the project root
- No package-local `.env` files
- Apps resolve the root env via `@repo/config` `getRootEnvPath()`

## Infrastructure (local)

```bash
docker compose up -d
```

Services: PostgreSQL (host port **5433** → container 5432), Redis, MinIO, Ollama.

> Host port 5433 avoids conflicts with a local Postgres already bound to 5432.

Deployment target: AWS EC2 with Docker Compose.

## Planned (not in Phase 1)

| Area | Direction |
|---|---|
| Auth | JWT access + refresh tokens; workspace membership authorization |
| AI | Local models via Ollama; provider-swappable abstraction; no paid LLM APIs |
| Jobs | BullMQ on Redis inside `worker` |
| Payments | Stripe subscriptions (monthly/annual), webhooks, upgrades/downgrades, cancellation, failed payments |
| Widget / SDK | `@repo/chat-widget` + `@repo/sdk` on Public Chat API |

## Principles

- TypeScript strict; avoid `any`
- Prefer dependency injection; avoid singleton globals unless necessary
- Feature-based modules; keep modules small
- Clean Architecture where practical — business logic does not depend on infrastructure
- Avoid circular dependencies; prefer composition over inheritance
- Do not generate unnecessary code or empty folders
- Shared packages remain reusable libraries

## Phase roadmap

1. **Foundation** (current) — monorepo, Docker, Prisma, Nest shells, dashboard shell
2. **Auth** — JWT, refresh tokens, workspace membership, `X-Workspace-Id`
3. **Core domain** — Workspaces / Agents / Documents / Conversations CRUD
4. **AI + Worker** — Ollama chat, BullMQ processors, document ingestion
5. **Payments** — Stripe subscriptions + webhooks
6. **Widget / SDK** — embeddable chat + React SDK (packages landed; CDN publish / theming polish next)
