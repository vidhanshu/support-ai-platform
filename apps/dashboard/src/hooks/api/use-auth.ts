"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsClient } from "usehooks-ts";
import {
  authApi,
  queryKeys,
  type LoginInput,
  type RegisterInput,
} from "@/lib/api";
import {
  AUTH_DEFAULT_REDIRECT,
  clearSession,
  getRefreshToken,
  hasSession,
  saveAuthTokens,
} from "@/lib/auth/tokens";
import { toastApiError, toastSuccess } from "@/lib/toast";

function usePostAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return () => {
    const next = searchParams.get("next");
    const target =
      next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.startsWith("/auth")
        ? next
        : AUTH_DEFAULT_REDIRECT;
    router.push(target);
    router.refresh();
  };
}

export function useMe(enabled = true) {
  // Defer session check until after hydrate so SSR and the first client
  // render stay aligned (localStorage is not available on the server).
  const isClient = useIsClient();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.me(),
    enabled: enabled && isClient && hasSession(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const redirectAfterAuth = usePostAuthRedirect();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (tokens) => {
      saveAuthTokens(tokens);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toastSuccess("Logged in successfully");
      redirectAfterAuth();
    },
    onError: (error) => {
      toastApiError(error, "Unable to sign in. Please try again.");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const redirectAfterAuth = usePostAuthRedirect();

  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (tokens) => {
      saveAuthTokens(tokens);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toastSuccess("Account created successfully");
      redirectAfterAuth();
    },
    onError: (error) => {
      toastApiError(error, "Unable to create your account. Please try again.");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
      toastSuccess("Logged out");
      router.push("/auth?mode=login");
      router.refresh();
    },
  });
}
