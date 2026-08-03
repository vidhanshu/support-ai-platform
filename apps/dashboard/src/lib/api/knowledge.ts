import { apiClient } from "./client";
import type { KnowledgeSource } from "./types";

export type CreateWebsiteInput = {
  url: string;
  name?: string;
  maxPages?: number;
  maxDepth?: number;
};

export const knowledgeApi = {
  list: () =>
    apiClient.get<KnowledgeSource[]>("/knowledge", { workspace: true }),

  get: (id: string) =>
    apiClient.get<KnowledgeSource>(`/knowledge/${id}`, { workspace: true }),

  remove: (id: string) =>
    apiClient.delete<void>(`/knowledge/${id}`, { workspace: true }),

  createWebsite: (input: CreateWebsiteInput) =>
    apiClient.post<KnowledgeSource>("/knowledge/websites", input, {
      workspace: true,
    }),
};
