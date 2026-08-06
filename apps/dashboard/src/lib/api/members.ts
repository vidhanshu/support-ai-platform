import { apiClient } from "./client";
import type { WorkspaceMember } from "./types";

export const membersApi = {
  list: () =>
    apiClient.get<WorkspaceMember[]>("/members", { workspace: true }),

  remove: (id: string) =>
    apiClient.delete<{ id: string }>(`/members/${id}`, { workspace: true }),
};
