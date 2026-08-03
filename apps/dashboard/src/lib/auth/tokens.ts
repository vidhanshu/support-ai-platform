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
