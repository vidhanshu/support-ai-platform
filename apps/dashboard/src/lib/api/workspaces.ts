import { apiClient } from "./client";
import type { Workspace } from "./types";

export type CreateWorkspaceInput = {
  name: string;
};

export type UpdateWorkspaceInput = {
  name: string;
};

export const workspacesApi = {
  list: () => apiClient.get<Workspace[]>("/workspaces"),

  get: (id: string) => apiClient.get<Workspace>(`/workspaces/${id}`),

  create: (input: CreateWorkspaceInput) =>
    apiClient.post<Workspace>("/workspaces", input),

  update: (id: string, input: UpdateWorkspaceInput) =>
    apiClient.patch<Workspace>(`/workspaces/${id}`, input, {
      workspace: true,
    }),

  remove: (id: string) => apiClient.delete<void>(`/workspaces/${id}`),
};
