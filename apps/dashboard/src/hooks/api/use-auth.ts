"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authApi,
  queryKeys,
  type LoginInput,
  type RegisterInput,
} from "@/lib/api";
import {
  clearSession,
  getRefreshToken,
  saveAuthTokens,
} from "@/lib/auth/tokens";
import { toastApiError, toastSuccess } from "@/lib/toast";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.me(),
    enabled: enabled && typeof window !== "undefined",
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (tokens) => {
      saveAuthTokens(tokens);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toastSuccess("Logged in successfully");
      router.push("/workspace");
      router.refresh();
    },
    onError: (error) => {
      toastApiError(error, "Unable to sign in. Please try again.");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (tokens) => {
      saveAuthTokens(tokens);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toastSuccess("Account created successfully");
      router.push("/workspace");
      router.refresh();
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
