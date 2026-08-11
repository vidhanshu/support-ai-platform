"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agentsApi,
  documentsApi,
  knowledgeApi,
  queryKeys,
  type CreateTextSnippetInput,
  type CreateWebsiteInput,
} from "@/lib/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import type { UploadProgress } from "@/lib/api/client";

function invalidateKnowledgeAndAgents(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string | null,
  agentId?: string,
) {
  if (!workspaceId) return;
  void queryClient.invalidateQueries({
    queryKey: queryKeys.knowledge.all(workspaceId),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.agents.all(workspaceId),
  });
  if (agentId) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.agents.detail(workspaceId, agentId),
    });
  }
}

export function useKnowledgeSources() {
  const { workspaceId, isReady } = useActiveWorkspace();

  return useQuery({
    queryKey: queryKeys.knowledge.list(workspaceId ?? "none"),
    queryFn: () => knowledgeApi.list(),
    enabled: isReady,
    refetchInterval: (query) => {
      const sources = query.state.data ?? [];
      const busy = sources.some(
        (source) =>
          source.status === "PENDING" || source.status === "PROCESSING",
      );
      return busy ? 5_000 : false;
    },
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
      invalidateKnowledgeAndAgents(queryClient, workspaceId, agentId);
    },
  });
}

export function useCreateTextSnippet(agentId?: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: async (input: CreateTextSnippetInput) => {
      const source = await knowledgeApi.createTextSnippet(input);
      if (agentId) {
        await agentsApi.attachKnowledgeSource(agentId, source.id);
      }
      return source;
    },
    onSuccess: () => {
      invalidateKnowledgeAndAgents(queryClient, workspaceId, agentId);
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
        queryKey: queryKeys.documents.all(workspaceId),
      });
      invalidateKnowledgeAndAgents(queryClient, workspaceId, agentId);
    },
  });
}

export function useDeleteKnowledgeSource() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (id: string) => knowledgeApi.remove(id),
    onSuccess: () => {
      invalidateKnowledgeAndAgents(queryClient, workspaceId);
    },
  });
}

export function useAttachKnowledgeSource(agentId: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (knowledgeSourceId: string) =>
      agentsApi.attachKnowledgeSource(agentId, knowledgeSourceId),
    onSuccess: () => {
      invalidateKnowledgeAndAgents(queryClient, workspaceId, agentId);
    },
  });
}

export function useDetachKnowledgeSource(agentId: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (knowledgeSourceId: string) =>
      agentsApi.detachKnowledgeSource(agentId, knowledgeSourceId),
    onSuccess: () => {
      invalidateKnowledgeAndAgents(queryClient, workspaceId, agentId);
    },
  });
}

/** Attach one knowledge source to multiple agents (workspace UI). */
export function useAttachSourceToAgents() {
  const queryClient = useQueryClient();
  const { workspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: async ({
      knowledgeSourceId,
      agentIds,
    }: {
      knowledgeSourceId: string;
      agentIds: string[];
    }) => {
      await Promise.all(
        agentIds.map((agentId) =>
          agentsApi.attachKnowledgeSource(agentId, knowledgeSourceId),
        ),
      );
    },
    onSuccess: () => {
      invalidateKnowledgeAndAgents(queryClient, workspaceId);
    },
  });
}
