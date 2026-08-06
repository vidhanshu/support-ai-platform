import { apiClient } from "./client";
import type {
  AcceptInvitationResponse,
  WorkspaceInvitation,
  WorkspaceRole,
} from "./types";

export type CreateInvitationInput = {
  email: string;
  role: Exclude<WorkspaceRole, "OWNER">;
};

export const invitationsApi = {
  list: () =>
    apiClient.get<WorkspaceInvitation[]>("/invitations", { workspace: true }),

  create: (input: CreateInvitationInput) =>
    apiClient.post<WorkspaceInvitation>("/invitations", input, {
      workspace: true,
    }),

  resend: (id: string) =>
    apiClient.post<WorkspaceInvitation>(
      `/invitations/${id}/resend`,
      undefined,
      { workspace: true },
    ),

  remove: (id: string) =>
    apiClient.delete<WorkspaceInvitation>(`/invitations/${id}`, {
      workspace: true,
    }),

  accept: (token: string) =>
    apiClient.post<AcceptInvitationResponse>(
      `/invitations/accept?token=${encodeURIComponent(token)}`,
    ),
};
