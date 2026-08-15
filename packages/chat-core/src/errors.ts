export class SupportAIError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options?: { status?: number; code?: string; details?: unknown },
  ) {
    super(message);
    this.name = "SupportAIError";
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export function extractErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  const nested =
    record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : null;

  for (const value of [nested?.message, record.message]) {
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value) && value.length) {
      return value.filter((v) => typeof v === "string").join(", ") || fallback;
    }
  }
  return fallback;
}

export function extractErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  const nested =
    record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : null;
  if (typeof nested?.code === "string") return nested.code;
  return typeof record.code === "string" ? record.code : undefined;
}
