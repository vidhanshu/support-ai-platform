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
  OLLAMA_BASE_URL: "OLLAMA_BASE_URL",
  OLLAMA_CHAT_MODEL: "OLLAMA_CHAT_MODEL",
  OLLAMA_EMBED_MODEL: "OLLAMA_EMBED_MODEL",
  API_PORT: "API_PORT",
  WORKER_PORT: "WORKER_PORT",
  JWT_ACCESS_SECRET: "JWT_ACCESS_SECRET",
  JWT_REFRESH_SECRET: "JWT_REFRESH_SECRET",
  MINIO_ENDPOINT_URL: "MINIO_ENDPOINT_URL",
  MINIO_ENDPOINT: "MINIO_ENDPOINT",
  MINIO_PORT: "MINIO_PORT",
  MINIO_ACCESS_KEY: "MINIO_ACCESS_KEY",
  MINIO_SECRET_KEY: "MINIO_SECRET_KEY",
  MINIO_REGION: "MINIO_REGION",
  MINIO_BUCKET: "MINIO_BUCKET",
  REDIS_HOST: "REDIS_HOST",
  REDIS_PORT: "REDIS_PORT",
} as const;

export const AI_CONFIGS = {
  DEFAULT_CHAT_MODEL: "llama3.1",
  DEFAULT_EMBED_MODEL: "nomic-embed-text",
  DEFAULT_TEMPERATURE: 0.2,
  /** Recent conversation turns sent to the LLM (excluding current user message) */
  MAX_CONTEXT_MESSAGES: 8,
  /** Final chunks sent to the LLM after dedupe + MMR */
  RETRIEVAL_TOP_K: 5,
  /** Initial vector search pool before dedupe/MMR */
  RETRIEVAL_CANDIDATE_K: 20,
  /** MMR: 1 = pure relevance, 0 = pure diversity */
  MMR_LAMBDA: 0.7,
  MAX_CHUNK_CHARS: 1000,
  /** Must be large enough to fit system prompt + retrieved chunks */
  NUM_CTX: 4096,
} as const;

export const JWT_CONFIGS = {
  ACCESS_TOKEN_MINS: 15,
  REFRESH_TOKEN_DAYS: 30,
} as const;

export const BCRYPT_CONFIGS = {
  SALT_ROUND: 12,
} as const;

export const HEADERS_KEYS = {
  WORKSPACE_ID: "x-workspace-id",
} as const;

export const INVITATION_CONFIGS = {
  EXPIRATION_DAYS: 3,
} as const;

export const MIME_TYPES = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  TXT: "text/plain",
  MD: "text/markdown",
}

export const DOCUMENT_CONFIGS = {
  ALLOWED_FILE_TYPES: [
    MIME_TYPES.PDF,
    MIME_TYPES.DOCX,
    MIME_TYPES.TXT,
    MIME_TYPES.MD,
  ],
  MAX_ALLOWED_FILE_SIZE: 20 * 1024 * 1024, // 20MB
} as const;

export const MIME_TYPE_TO_EXTENSION = {
  [MIME_TYPES.PDF]: ".pdf",
  [MIME_TYPES.DOCX]: ".docx",
  [MIME_TYPES.TXT]: ".txt",
  [MIME_TYPES.MD]: ".md",
} as const;

export const STORAGE_CONFIGS = {
  UPLOAD_URL_EXPIRATION_SECONDS: 60 * 15,
  DOWNLOAD_URL_EXPIRATION_SECONDS: 60 * 15,
} as const;

export const QUEUE_CONFIGS = {
  REDIS: {
    HOST: ENV_KEYS.REDIS_HOST,
    PORT: ENV_KEYS.REDIS_PORT,
  },
};

export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: "document-processing",
} as const;

export const JOB_NAMES = {
  PROCESS_DOCUMENT: "process-document",
} as const;
