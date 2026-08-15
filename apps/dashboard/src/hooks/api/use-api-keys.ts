"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agentApiKeysApi,
  queryKeys,
  type CreateAgentApiKeyInput,
} from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";

export function useAgentApiKeys(agentId: string | null | undefined) {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.agents.apiKeys(
      workspaceId ?? "none",
      agentId ?? "unknown",
    ),
    queryFn: () => agentApiKeysApi.list(agentId!),
    enabled: isReady && Boolean(agentId),
  });
}

export function useCreateAgentApiKey(agentId: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (input: CreateAgentApiKeyInput) =>
      agentApiKeysApi.create(agentId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.apiKeys(workspaceId ?? "none", agentId),
      });
    },
  });
}

export function useRevokeAgentApiKey(agentId: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (keyId: string) => agentApiKeysApi.revoke(agentId, keyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.apiKeys(workspaceId ?? "none", agentId),
      });
    },
  });
}
