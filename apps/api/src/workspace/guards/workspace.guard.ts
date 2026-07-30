import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@repo/database";
import { AuthenticatedRequest } from "../../common/interfaces/request.interface";
import { HEADERS_KEYS } from "@repo/config";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const workspaceId = request.headers[HEADERS_KEYS.WORKSPACE_ID] as string;

    if (!workspaceId) {
      throw new BadRequestException("Missing X-Workspace-Id header");
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          userId: request.user.id,
          workspaceId,
        },
      },
      select: {
        role: true,
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException("Workspace not found");
    }

    request.workspace = {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      role: membership.role,
    };

    return true;
  }
}
