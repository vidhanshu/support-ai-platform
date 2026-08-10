import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { Prisma, PrismaService, WorkspaceRole } from "@repo/database";
import * as crypto from "crypto";
import dayjs from "dayjs";
import {
  ENV_KEYS,
  INVITATION_CONFIGS,
  JOB_NAMES,
  QUEUE_NAMES,
} from "@repo/config";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import { JwtUser } from "../auth/interfaces/jwt.interface";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import type { EmailJobPayload } from "@repo/email";
import { ConfigService } from "@nestjs/config";
import { PlanLimitsService } from "../billing/plan-limits.service";

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly planLimits: PlanLimitsService,
    @InjectQueue(QUEUE_NAMES.EMAIL)
    private readonly emailQueue: Queue<EmailJobPayload>,
  ) {}

  async create(
    workspace: WorkspaceContext,
    user: JwtUser,
    dto: CreateInvitationDto,
  ) {
    await this.planLimits.assertCanAddMember(workspace.id);

    const email = dto.email;

    const dbUser = await this.prisma.user.findUnique({ where: { email } });

    if (dbUser) {
      const alreadyMember = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspace.id,
            userId: dbUser.id,
          },
        },
      });

      if (alreadyMember)
        throw new BadRequestException(
          "User is already a member of the workspace",
        );
    }

    const dbInvite = await this.prisma.workspaceInvitation.findFirst({
      where: {
        email,
        workspaceId: workspace.id,
        expiresAt: { gt: new Date() },
        acceptedAt: null,
      },
    });
    if (dbInvite) {
      throw new ConflictException("Invitation already sent");
    }

    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = dayjs()
        .add(INVITATION_CONFIGS.EXPIRATION_DAYS, "day")
        .toDate();

      const dbInvitation = await this.prisma.workspaceInvitation.create({
        data: {
          email: dto.email,
          role: dto.role as WorkspaceRole,
          workspaceId: workspace.id,
          invitedById: user.id,
          expiresAt,
          token,
        },
      });

      const appWebUrl = this.configService.getOrThrow<string>(
        ENV_KEYS.APP_WEB_URL,
      );
      const inviteUrl = `${appWebUrl.replace(/\/$/, "")}/invitations/accept?token=${token}`;

      await this.emailQueue.add(
        JOB_NAMES.SEND_EMAIL,
        {
          kind: "workspace_invite",
          to: dto.email,
          workspaceName: workspace.name,
          inviterEmail: user.email,
          role: dto.role as string,
          inviteUrl,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );

      return dbInvitation;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Please try again");
      }
      throw error;
    }
  }

  async accept(user: JwtUser, token: string) {
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { token },
    });
    if (!invitation || invitation.acceptedAt)
      throw new NotFoundException("No invitation found");
    if (dayjs(invitation.expiresAt).isBefore(dayjs())) {
      await this.prisma.workspaceInvitation.delete({
        where: { id: invitation.id },
      });
      throw new UnauthorizedException("Invitation expired");
    }

    if (invitation.email !== user.email)
      throw new ForbiddenException(
        "This invitation belongs to another email address",
      );

    try {
      const [, , workspace] = await this.prisma.$transaction([
        this.prisma.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            role: invitation.role,
          },
        }),
        this.prisma.workspaceInvitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: new Date() },
        }),
        this.prisma.workspace.findUniqueOrThrow({
          where: { id: invitation.workspaceId },
          select: { id: true, name: true, slug: true },
        }),
      ]);

      return {
        workspaceId: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role: invitation.role,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("User is already a member of workspace");
      }
      throw error;
    }
  }

  async findAll(workspace: WorkspaceContext) {
    return this.prisma.workspaceInvitation.findMany({
      where: {
        workspaceId: workspace.id,
        acceptedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async resend(
    workspace: WorkspaceContext,
    user: JwtUser,
    id: string,
  ) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
        acceptedAt: null,
      },
    });
    if (!invitation) throw new NotFoundException("No invitation found");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = dayjs()
      .add(INVITATION_CONFIGS.EXPIRATION_DAYS, "day")
      .toDate();

    const updated = await this.prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { token, expiresAt },
    });

    const appWebUrl = this.configService.getOrThrow<string>(
      ENV_KEYS.APP_WEB_URL,
    );
    const inviteUrl = `${appWebUrl.replace(/\/$/, "")}/invitations/accept?token=${token}`;

    await this.emailQueue.add(
      JOB_NAMES.SEND_EMAIL,
      {
        kind: "workspace_invite",
        to: invitation.email,
        workspaceName: workspace.name,
        inviterEmail: user.email,
        role: invitation.role as string,
        inviteUrl,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    return updated;
  }

  async remove(workspace: WorkspaceContext, id: string) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!invitation) throw new NotFoundException("No invitation found");

    return this.prisma.workspaceInvitation.delete({
      where: { id: invitation.id },
    });
  }
}
