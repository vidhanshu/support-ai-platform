import { apiClient } from "./client";
import type { AuthTokensResponse, User } from "./types";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
};

export const authApi = {
  login: (input: LoginInput) =>
    apiClient.post<AuthTokensResponse>("/auth/login", input, { auth: false }),

  register: (input: RegisterInput) =>
    apiClient.post<AuthTokensResponse>("/auth/register", input, {
      auth: false,
    }),

  me: () => apiClient.get<User>("/auth/me"),

  logout: (refreshToken: string) =>
    apiClient.post<void>("/auth/logout", { refreshToken }),

  logoutAll: () => apiClient.post<void>("/auth/logout-all"),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokensResponse>(
      "/auth/refresh",
      { refreshToken },
      { auth: false, skipRefresh: true },
    ),

  verifyEmail: (token: string) =>
    apiClient.post<{ verified: boolean }>(
      "/auth/verify-email",
      { token },
      { auth: false },
    ),

  resendVerification: () =>
    apiClient.post<{ queued: boolean }>("/auth/resend-verification"),
};
