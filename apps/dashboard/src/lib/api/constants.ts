export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

/** Mirrors API `HEADERS_KEYS.WORKSPACE_ID` from `@repo/config`. */
export const API_HEADERS = {
  WORKSPACE_ID: "x-workspace-id",
} as const;

/**
 * Free ngrok blocks browser XHR without this (ERR_NGROK_6024).
 * Harmless when not using ngrok.
 */
export const NGROK_SKIP_BROWSER_WARNING = {
  "ngrok-skip-browser-warning": "true",
} as const;
