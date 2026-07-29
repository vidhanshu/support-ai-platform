# Support AI Platform

Production-grade, AI-powered customer support platform (educational / architecture-first).

See [CONTEXT.md](./CONTEXT.md) for architecture decisions and roadmap.

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker + Docker Compose

## Quick start

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

| Service | URL |
|---|---|
| Dashboard | http://localhost:3000 |
| API health | http://localhost:3001/health |
| Worker health | http://localhost:3002/health |
| PostgreSQL | `localhost:5433` (mapped from container `5432`) |
| Redis | `localhost:6379` |
| MinIO console | http://localhost:9001 |
| Ollama | http://localhost:11434 |

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
apps/api          NestJS HTTP API
apps/worker       NestJS background worker
apps/dashboard    Next.js dashboard
packages/database Prisma + PrismaModule / PrismaService
packages/*        Shared libraries and tooling configs
```

## Phase 1 scope

Foundation only: monorepo tooling, Docker infra, database package, Nest shells with health checks, dashboard shell.

Not included yet: auth, domain CRUD, Ollama chat, BullMQ jobs, Stripe, widget.
