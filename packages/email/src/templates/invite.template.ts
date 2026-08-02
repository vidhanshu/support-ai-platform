export function renderWorkspaceInviteEmail(input: {
  workspaceName: string;
  inviterEmail: string;
  role: string;
  inviteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `You're invited to ${input.workspaceName} — Support AI`,
    html: `
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; line-height: 1.5; color: #111;">
    <h2>Workspace invitation</h2>
    <p>
      <strong>${input.inviterEmail}</strong> invited you to join
      <strong>${input.workspaceName}</strong> as <strong>${input.role}</strong>.
    </p>
    <p>
      <a href="${input.inviteUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
        Accept invitation
      </a>
    </p>
    <p>Or open this link:</p>
    <p><a href="${input.inviteUrl}">${input.inviteUrl}</a></p>
    <p>If you don't have an account yet, register with this email first, then accept the invite.</p>
  </body>
</html>
`.trim(),
  };
}
