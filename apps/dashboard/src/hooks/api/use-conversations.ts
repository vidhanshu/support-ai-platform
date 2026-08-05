"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  conversationsApi,
  queryKeys,
  type BulkDeleteConversationsInput,
} from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";

export function useConversations(agentId: string | null | undefined) {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.conversations.listByAgent(
      workspaceId ?? "none",
      agentId ?? "unknown",
    ),
    queryFn: () => conversationsApi.listByAgent(agentId!),
    enabled: isReady && Boolean(agentId),
  });
}

export function useConversation(id: string | null | undefined) {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.conversations.detail(
      workspaceId ?? "none",
      id ?? "unknown",
    ),
    queryFn: () => conversationsApi.get(id!),
    enabled: isReady && Boolean(id),
  });
}

export function useBulkDeleteConversations(agentId: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (ids: string[]) =>
      conversationsApi.removeMany({
        agentId,
        ids,
      } satisfies BulkDeleteConversationsInput),
    onSuccess: (_data, ids) => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.listByAgent(workspaceId, agentId),
      });
      for (const id of ids) {
        void queryClient.removeQueries({
          queryKey: queryKeys.conversations.detail(workspaceId, id),
        });
      }
    },
  });
}
