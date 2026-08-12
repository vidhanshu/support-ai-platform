# syntax=docker/dockerfile:1

# Monorepo image for Nest apps (`api` or `worker`).
# Build from repo root:
#   docker build -f apps/api/Dockerfile --build-arg APP_DIR=api --build-arg APP_FILTER=@repo/api -t support-ai-api .
#   docker build -f apps/worker/Dockerfile --build-arg APP_DIR=worker --build-arg APP_FILTER=@repo/worker -t support-ai-worker .

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS builder
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

ARG APP_FILTER=@repo/api

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

# postinstall runs `prisma generate`, which requires DATABASE_URL to be set
# (no live DB needed at generate time).
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/support_ai?schema=public"

RUN pnpm install --frozen-lockfile
# Ensure incremental TS buildinfo from the host cannot skip JS emit
RUN find . -name '*.tsbuildinfo' -delete
RUN pnpm --filter "${APP_FILTER}..." build

FROM base AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

ARG APP_DIR=api
ENV NODE_ENV=production
ENV APP_DIR=${APP_DIR}

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY docker/app-entrypoint.sh /app-entrypoint.sh
RUN chmod +x /app-entrypoint.sh

WORKDIR /app/apps/${APP_DIR}
EXPOSE 3001 3002
ENTRYPOINT ["/app-entrypoint.sh"]
CMD ["node", "dist/main.js"]
