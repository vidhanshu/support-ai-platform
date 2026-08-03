import { apiClient } from "./client";
import type { Agent } from "./types";

/**
 * Workspace-scoped agents API.
 * Always pass `{ workspace: true }` so `x-workspace-id` is sent.
 */
export type CreateAgentInput = {
  name: string;
  systemPrompt?: string;
  description?: string;
  model?: string;
  temperature?: number;
};

export type UpdateAgentInput = Partial<CreateAgentInput>;

export const agentsApi = {
  list: () => apiClient.get<Agent[]>("/agents", { workspace: true }),

  get: (id: string) =>
    apiClient.get<Agent>(`/agents/${id}`, { workspace: true }),

  create: (input: CreateAgentInput) =>
    apiClient.post<Agent>("/agents", input, { workspace: true }),

  update: (id: string, input: UpdateAgentInput) =>
    apiClient.patch<Agent>(`/agents/${id}`, input, { workspace: true }),

  remove: (id: string) =>
    apiClient.delete<void>(`/agents/${id}`, { workspace: true }),

  attachKnowledgeSource: (agentId: string, knowledgeSourceId: string) =>
    apiClient.post<void>(
      `/agents/${agentId}/attach-knowledge-source/${knowledgeSourceId}`,
      undefined,
      { workspace: true },
    ),

  detachKnowledgeSource: (agentId: string, knowledgeSourceId: string) =>
    apiClient.delete<void>(
      `/agents/${agentId}/detach-knowledge-source/${knowledgeSourceId}`,
      { workspace: true },
    ),
};
