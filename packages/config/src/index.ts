import fs from "node:fs";
import path from "node:path";

/** Absolute path to the monorepo root `.env` file. */
export function getRootEnvPath(fromDir: string = process.cwd()): string {
  let current = path.resolve(fromDir);

  for (let i = 0; i < 6; i += 1) {
    const workspaceMarker = path.join(current, "pnpm-workspace.yaml");

    if (fs.existsSync(workspaceMarker)) {
      return path.join(current, ".env");
    }

    current = path.dirname(current);
  }

  return path.resolve(fromDir, "../../.env");
}

export const ENV_KEYS = {
  DATABASE_URL: "DATABASE_URL",
  REDIS_URL: "REDIS_URL",
  MINIO_ENDPOINT: "MINIO_ENDPOINT",
  MINIO_PORT: "MINIO_PORT",
  MINIO_ACCESS_KEY: "MINIO_ACCESS_KEY",
  MINIO_SECRET_KEY: "MINIO_SECRET_KEY",
  OLLAMA_BASE_URL: "OLLAMA_BASE_URL",
  API_PORT: "API_PORT",
  WORKER_PORT: "WORKER_PORT",
  JWT_ACCESS_SECRET: "JWT_ACCESS_SECRET",
  JWT_REFRESH_SECRET: "JWT_REFRESH_SECRET",
} as const;

export const JWT_CONFIGS = {
  ACCESS_TOKEN_MINS: 15,
  REFRESH_TOKEN_DAYS: 30,
} as const;

export const BCRYPT_CONFIGS = {
  SALT_ROUND: 12,
} as const;
