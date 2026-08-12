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

First run pulls Ollama models (`qwen2.5:3b`, `nomic-embed-text`) and can take a while.

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
packages/*        Shared libraries (built into api/worker images)
```
