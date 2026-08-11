import fs from "node:fs";
import path from "node:path";
import { DEFAULT_AGENT_MODEL, DEFAULT_AGENT_TEMPERATURE } from "./agent-models";

export {
  AVAILABLE_AGENT_MODELS,
  AGENT_MODEL_IDS,
  DEFAULT_AGENT_MODEL,
  DEFAULT_AGENT_TEMPERATURE,
  resolveAgentModel,
  type AgentModelId,
} from "./agent-models";

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
  RESEND_API_KEY: "RESEND_API_KEY",
  EMAIL_FROM: "EMAIL_FROM",
  /** `resend` (default) or `console` for local dev without a domain */
  EMAIL_PROVIDER: "EMAIL_PROVIDER",
  APP_WEB_URL: "APP_WEB_URL",
  STRIPE_SECRET_KEY: "STRIPE_SECRET_KEY",
  STRIPE_WEBHOOK_SECRET: "STRIPE_WEBHOOK_SECRET",
  STRIPE_HOBBY_PRICE_ID: "STRIPE_HOBBY_PRICE_ID",
  STRIPE_PRO_PRICE_ID: "STRIPE_PRO_PRICE_ID",
} as const;

export type PlanId = "FREE" | "HOBBY" | "PRO";

export type PlanLimits = {
  agents: number;
  knowledgeSources: number;
  chatMessagesPerMonth: number;
  websiteSources: boolean;
  teamMembers: number;
};

/** Single source of truth for application plan limits (not Stripe prices). */
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  FREE: {
    agents: 1,
    knowledgeSources: 3,
    chatMessagesPerMonth: 100,
    websiteSources: false,
    teamMembers: 1,
  },
  HOBBY: {
    agents: 3,
    knowledgeSources: 15,
    chatMessagesPerMonth: 2000,
    websiteSources: true,
    teamMembers: 3,
  },
  PRO: {
    agents: 10,
    knowledgeSources: 100,
    chatMessagesPerMonth: 20000,
    websiteSources: true,
    teamMembers: 10,
  },
} as const;

export const AI_CONFIGS = {
  /** Mirrors AVAILABLE_AGENT_MODELS[0] — keep in sync via DEFAULT_AGENT_MODEL */
  DEFAULT_CHAT_MODEL: DEFAULT_AGENT_MODEL,
  DEFAULT_EMBED_MODEL: "nomic-embed-text",
  DEFAULT_TEMPERATURE: DEFAULT_AGENT_TEMPERATURE,
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

export const EMAIL_CONFIGS = {
  VERIFICATION_EXPIRATION_HOURS: 24,
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

export const WEBSITE_CONFIGS = {
  DEFAULT_MAX_PAGES: 50,
  DEFAULT_MAX_DEPTH: 2,
  MAX_ALLOWED_PAGES: 200,
  MAX_ALLOWED_DEPTH: 3,
  MAX_RESPONSE_BYTES: 2 * 1024 * 1024, // 2MB
  FETCH_TIMEOUT_MS: 15_000,
  FETCH_CONCURRENCY: 3,
  MIN_TEXT_CHARS: 80,
  USER_AGENT: "SupportAIBot/1.0 (+https://localhost; knowledge-crawler)",
} as const;

export const TEXT_SNIPPET_CONFIGS = {
  MAX_CONTENT_BYTES: 1 * 1024 * 1024, // 1MB
  MIN_CONTENT_CHARS: 1,
  MAX_TITLE_LENGTH: 200,
} as const;

export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: "document-processing",
  WEBSITE_PROCESSING: "website-processing",
  TEXT_SNIPPET_PROCESSING: "text-snippet-processing",
  EMAIL: "email",
} as const;

export const JOB_NAMES = {
  PROCESS_DOCUMENT: "process-document",
  CRAWL_WEBSITE: "process-website",
  PROCESS_TEXT_SNIPPET: "process-text-snippet",
  SEND_EMAIL: "send-email",
} as const;
