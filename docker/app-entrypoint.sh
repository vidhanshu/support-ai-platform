#!/bin/sh
set -e

cd /app

# Apply migrations once from the API container before serving traffic.
if [ "${APP_DIR}" = "api" ] && [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Running prisma migrate deploy..."
  pnpm --filter @repo/database exec prisma migrate deploy
fi

cd "/app/apps/${APP_DIR}"
echo "[entrypoint] Starting ${APP_DIR}..."
exec "$@"
