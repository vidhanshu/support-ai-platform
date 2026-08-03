"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  queryKeys,
  workspacesApi,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
} from "@/lib/api";
import { getAccessToken, setWorkspaceId } from "@/lib/auth/tokens";

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.list(),
    queryFn: () => workspacesApi.list(),
    enabled: typeof window !== "undefined" && Boolean(getAccessToken()),
  });
}

export function useWorkspace(id: string | null) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id ?? "unknown"),
    queryFn: () => workspacesApi.get(id!),
    enabled: Boolean(id) && typeof window !== "undefined",
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspacesApi.create(input),
    onSuccess: (workspace) => {
      setWorkspaceId(workspace.id);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
}

export function useUpdateWorkspace(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateWorkspaceInput) =>
      workspacesApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspacesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
}
