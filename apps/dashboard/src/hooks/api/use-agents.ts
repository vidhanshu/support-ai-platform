"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agentsApi,
  queryKeys,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";

function requireWorkspaceId(workspaceId: string | null) {
  if (!workspaceId) {
    throw new Error("No workspace selected");
  }
  return workspaceId;
}

export function useAgents() {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.agents.list(workspaceId ?? "none"),
    queryFn: () => agentsApi.list(),
    enabled: isReady,
  });
}

export function useAgent(id: string | null | undefined) {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.agents.detail(workspaceId ?? "none", id ?? "unknown"),
    queryFn: () => agentsApi.get(id!),
    enabled: isReady && Boolean(id),
    refetchInterval: (query) => {
      const sources = query.state.data?.knowledgeSources ?? [];
      const busy = sources.some((item) => {
        const status = item.knowledgeSource.status;
        return status === "PENDING" || status === "PROCESSING";
      });
      return busy ? 5_000 : false;
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (input: CreateAgentInput) => agentsApi.create(input),
    onSuccess: () => {
      const id = requireWorkspaceId(workspaceId);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.all(id),
      });
    },
  });
}

export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (input: UpdateAgentInput) => agentsApi.update(id, input),
    onSuccess: () => {
      const activeId = requireWorkspaceId(workspaceId);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.all(activeId),
      });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (id: string) => agentsApi.remove(id),
    onSuccess: () => {
      const id = requireWorkspaceId(workspaceId);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.all(id),
      });
    },
  });
}
