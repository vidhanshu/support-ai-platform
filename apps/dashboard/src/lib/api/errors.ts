export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiErrorBody = {
  success?: boolean;
  error?: {
    statusCode?: number;
    message?: string | string[];
    code?: string;
  };
  message?: string | string[];
  code?: string;
};

function normalizeMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(", ");
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return null;
}

/** Extract human-readable message from Nest envelope / legacy shapes. */
export function extractApiErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;

  const payload = body as ApiErrorBody;
  return (
    normalizeMessage(payload.error?.message) ??
    normalizeMessage(payload.message) ??
    fallback
  );
}

export function extractApiErrorCode(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const payload = body as ApiErrorBody;
  return payload.error?.code ?? payload.code;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function isPlanLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "PLAN_LIMIT_REACHED";
}
