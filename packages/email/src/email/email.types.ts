export type VerificationEmailPayload = {
  kind: "verification";
  to: string;
  verifyUrl: string;
};

export type WorkspaceInviteEmailPayload = {
  kind: "workspace_invite";
  to: string;
  workspaceName: string;
  inviterEmail: string;
  role: string;
  inviteUrl: string;
};

export type EmailJobPayload =
  | VerificationEmailPayload
  | WorkspaceInviteEmailPayload;

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};
