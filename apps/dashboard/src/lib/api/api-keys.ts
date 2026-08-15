import { apiClient } from "./client";

export type AgentApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  allowedOrigins: string[];
  rateLimitRpm: number;
  lastUsedAt: string | null;
  createdAt: string;
};

export type CreatedAgentApiKey = AgentApiKey & {
  /** Returned only once at creation */
  secret: string;
};

export type CreateAgentApiKeyInput = {
  name: string;
  allowedOrigins: string[];
  rateLimitRpm?: number;
};

export const agentApiKeysApi = {
  list: (agentId: string) =>
    apiClient.get<AgentApiKey[]>(`/agents/${agentId}/api-keys`, {
      workspace: true,
    }),

  create: (agentId: string, input: CreateAgentApiKeyInput) =>
    apiClient.post<CreatedAgentApiKey>(
      `/agents/${agentId}/api-keys`,
      input,
      { workspace: true },
    ),

  revoke: (agentId: string, keyId: string) =>
    apiClient.delete<{ id: string }>(
      `/agents/${agentId}/api-keys/${keyId}`,
      { workspace: true },
    ),
};
