import { Inject, Injectable, Logger } from "@nestjs/common";
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

  constructor(
    @Inject("RESEND_CLIENT") private readonly resend: Resend,
    configService: ConfigService,
  ) {
    this.from = configService.getOrThrow<string>(ENV_KEYS.EMAIL_FROM);
  }

  async sendEmail(input: SendEmailInput) {
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
