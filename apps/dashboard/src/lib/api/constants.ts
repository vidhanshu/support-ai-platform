export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

/** Mirrors API `HEADERS_KEYS.WORKSPACE_ID` from `@repo/config`. */
export const API_HEADERS = {
  WORKSPACE_ID: "x-workspace-id",
} as const;
