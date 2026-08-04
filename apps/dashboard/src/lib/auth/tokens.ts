export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = "support_ai_access_token";
const REFRESH_TOKEN_KEY = "support_ai_refresh_token";
const WORKSPACE_ID_KEY = "support_ai_workspace_id";

export function saveAuthTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getWorkspaceId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WORKSPACE_ID_KEY);
}

export function setWorkspaceId(workspaceId: string) {
  localStorage.setItem(WORKSPACE_ID_KEY, workspaceId);
}

export function clearWorkspaceId() {
  localStorage.removeItem(WORKSPACE_ID_KEY);
}

export function clearSession() {
  clearAuthTokens();
  clearWorkspaceId();
}

/** True when either access or refresh token is present (client-only). */
export function hasSession() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export const AUTH_LOGIN_PATH = "/auth?mode=login";
export const AUTH_DEFAULT_REDIRECT = "/dashboard";

/**
 * Hard redirect to login after session loss (e.g. failed refresh).
 * Skips when already on an auth route to avoid loops.
 */
export function redirectToLogin(options?: { next?: string }) {
  if (typeof window === "undefined") return;

  const { pathname, search } = window.location;
  if (pathname.startsWith("/auth")) return;

  const next = options?.next ?? `${pathname}${search}`;
  const params = new URLSearchParams({ mode: "login" });
  if (next && next !== "/" && !next.startsWith("/auth")) {
    params.set("next", next);
  }

  window.location.replace(`/auth?${params.toString()}`);
}
