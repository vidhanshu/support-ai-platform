"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agentsApi,
  queryKeys,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "@/lib/api";
import { getWorkspaceId } from "@/lib/auth/tokens";

function requireWorkspaceId() {
  const workspaceId = getWorkspaceId();
  if (!workspaceId) {
    throw new Error("No workspace selected");
  }
  return workspaceId;
}

export function useAgents() {
  const workspaceId = getWorkspaceId();

  return useQuery({
    queryKey: queryKeys.agents.list(workspaceId ?? "none"),
    queryFn: () => agentsApi.list(),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAgentInput) => agentsApi.create(input),
    onSuccess: () => {
      const workspaceId = requireWorkspaceId();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.all(workspaceId),
      });
    },
  });
}

export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAgentInput) => agentsApi.update(id, input),
    onSuccess: () => {
      const workspaceId = requireWorkspaceId();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.all(workspaceId),
      });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentsApi.remove(id),
    onSuccess: () => {
      const workspaceId = requireWorkspaceId();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agents.all(workspaceId),
      });
    },
  });
}
