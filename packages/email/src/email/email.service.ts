import { Inject, Injectable, Logger, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ENV_KEYS } from "@repo/config";
import { Resend } from "resend";
import { renderVerificationEmail } from "../templates/verification.template";
import { renderWorkspaceInviteEmail } from "../templates/invite.template";
import type {
  EmailJobPayload,
  SendEmailInput,
  VerificationEmailPayload,
  WorkspaceInviteEmailPayload,
} from "./email.types";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly provider: "resend" | "console";

  constructor(
    configService: ConfigService,
    @Optional() @Inject("RESEND_CLIENT") private readonly resend: Resend | null,
  ) {
    this.from = configService.get<string>(ENV_KEYS.EMAIL_FROM) ?? "Support AI <dev@localhost>";
    const raw = (
      configService.get<string>(ENV_KEYS.EMAIL_PROVIDER) ?? "resend"
    ).toLowerCase();
    this.provider = raw === "console" ? "console" : "resend";
  }

  async sendEmail(input: SendEmailInput) {
    if (this.provider === "console") {
      this.logger.log(
        [
          "[console email]",
          `from=${this.from}`,
          `to=${input.to}`,
          `subject=${input.subject}`,
          input.html,
        ].join("\n"),
      );
      return { id: `console-${Date.now()}` };
    }

    if (!this.resend) {
      throw new Error(
        "EMAIL_PROVIDER=resend but RESEND_API_KEY is not configured",
      );
    }

    const result = await this.resend.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (result.error) {
      this.logger.error(
        `Resend failed to=${input.to} subject=${input.subject}: ${result.error.message}`,
      );
      throw new Error(result.error.message);
    }

    this.logger.log(
      `Email sent to=${input.to} subject=${input.subject} id=${result.data?.id ?? "unknown"}`,
    );
    return result.data;
  }

  async sendVerificationEmail(payload: VerificationEmailPayload) {
    const template = renderVerificationEmail({
      verifyUrl: payload.verifyUrl,
    });
    return this.sendEmail({
      to: payload.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendWorkspaceInviteEmail(payload: WorkspaceInviteEmailPayload) {
    const template = renderWorkspaceInviteEmail({
      workspaceName: payload.workspaceName,
      inviterEmail: payload.inviterEmail,
      role: payload.role,
      inviteUrl: payload.inviteUrl,
    });
    return this.sendEmail({
      to: payload.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendFromJob(payload: EmailJobPayload) {
    switch (payload.kind) {
      case "verification":
        return this.sendVerificationEmail(payload);
      case "workspace_invite":
        return this.sendWorkspaceInviteEmail(payload);
      default: {
        const exhaustive: never = payload;
        throw new Error(`Unknown email job: ${JSON.stringify(exhaustive)}`);
      }
    }
  }
}
