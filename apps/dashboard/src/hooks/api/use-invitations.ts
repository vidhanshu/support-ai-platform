"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  invitationsApi,
  queryKeys,
  type CreateInvitationInput,
} from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";

export function useInvitations(enabled = true) {
  const { workspaceId, isReady, workspace } = useActiveWorkspace();
  const canManage =
    workspace?.role === "OWNER" || workspace?.role === "ADMIN";

  return useQuery({
    queryKey: queryKeys.invitations.list(workspaceId ?? "none"),
    queryFn: () => invitationsApi.list(),
    enabled: enabled && isReady && canManage,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (input: CreateInvitationInput) =>
      invitationsApi.create(input),
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.all(workspaceId),
      });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (id: string) => invitationsApi.resend(id),
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.all(workspaceId),
      });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (id: string) => invitationsApi.remove(id),
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.all(workspaceId),
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => invitationsApi.accept(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
}
