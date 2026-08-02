export function renderVerificationEmail(input: {
  verifyUrl: string;
}): { subject: string; html: string } {
  return {
    subject: "Verify your email — Support AI",
    html: `
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; line-height: 1.5; color: #111;">
    <h2>Verify your email</h2>
    <p>Thanks for signing up for Support AI. Please confirm your email address:</p>
    <p>
      <a href="${input.verifyUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
        Verify email
      </a>
    </p>
    <p>Or open this link:</p>
    <p><a href="${input.verifyUrl}">${input.verifyUrl}</a></p>
    <p>This link expires in 24 hours.</p>
  </body>
</html>
`.trim(),
  };
}
