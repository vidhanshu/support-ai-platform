"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agentsApi,
  documentsApi,
  knowledgeApi,
  queryKeys,
  type CreateWebsiteInput,
} from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import type { UploadProgress } from "@/lib/api/client";

export function useKnowledgeSources() {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.knowledge.list(workspaceId ?? "none"),
    queryFn: () => knowledgeApi.list(),
    enabled: isReady,
  });
}

export function useCreateWebsite(agentId?: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: async (input: CreateWebsiteInput) => {
      const source = await knowledgeApi.createWebsite(input);
      if (agentId) {
        await agentsApi.attachKnowledgeSource(agentId, source.id);
      }
      return source;
    },
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.knowledge.all(workspaceId),
      });
      if (agentId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.agents.detail(workspaceId, agentId),
        });
      }
    },
  });
}

export function useUploadDocument(agentId?: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: async ({
      file,
      onUploadProgress,
    }: {
      file: File;
      onUploadProgress?: (progress: UploadProgress) => void;
    }) => {
      const document = await documentsApi.upload(file, onUploadProgress);
      if (agentId && document.knowledgeSourceId) {
        await agentsApi.attachKnowledgeSource(
          agentId,
          document.knowledgeSourceId,
        );
      }
      return document;
    },
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.knowledge.all(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documents.all(workspaceId),
      });
      if (agentId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.agents.detail(workspaceId, agentId),
        });
      }
    },
  });
}

export function useDeleteKnowledgeSource(agentId?: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (id: string) => knowledgeApi.remove(id),
    onSuccess: () => {
      if (!workspaceId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.knowledge.all(workspaceId),
      });
      if (agentId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.agents.detail(workspaceId, agentId),
        });
      }
    },
  });
}
