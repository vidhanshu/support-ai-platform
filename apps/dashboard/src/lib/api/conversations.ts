import { apiClient } from "./client";
import type { ConversationDetail, ConversationListItem } from "./types";

export type BulkDeleteConversationsInput = {
  agentId: string;
  ids: string[];
};

export type BulkDeleteConversationsResponse = {
  deletedCount: number;
  ids: string[];
};

export const conversationsApi = {
  listByAgent: (agentId: string) =>
    apiClient.get<ConversationListItem[]>(
      `/conversation?agentId=${encodeURIComponent(agentId)}`,
      { workspace: true },
    ),

  get: (id: string) =>
    apiClient.get<ConversationDetail>(`/conversation/${id}`, {
      workspace: true,
    }),

  removeMany: (input: BulkDeleteConversationsInput) =>
    apiClient.post<BulkDeleteConversationsResponse>(
      "/conversation/bulk-delete",
      input,
      { workspace: true },
    ),
};
