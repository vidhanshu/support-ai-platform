"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { membersApi, queryKeys } from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";

export function useMembers() {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.members.list(workspaceId ?? "none"),
    queryFn: () => membersApi.list(),
    enabled: isReady,
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (id: string) => membersApi.remove(id),
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.members.all(workspaceId),
      });
    },
  });
}
