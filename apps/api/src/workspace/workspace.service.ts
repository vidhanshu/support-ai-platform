import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateWorkspaceDto } from "./dtos/create-workspace.dto";
import { JwtUser } from "../auth/interfaces/jwt.interface";
import {
  Prisma,
  PrismaService,
  Workspace,
  WorkspaceRole,
} from "@repo/database";
import { generateSlug, normalizeSlug } from "./utils";
import { UpdateWorkspaceDto } from "./dtos/update-workspace.dto";
import type { WorkspaceContext } from "../common/interfaces/request.interface";

@Injectable()
export class WorkspaceService {
  constructor(private prismaService: PrismaService) {}

  async checkWorkspaceExistenceAndOwnership(
    user: JwtUser,
    id: string,
  ): Promise<Workspace> {
    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        id,
        members: { some: { userId: user.id, role: WorkspaceRole.OWNER } },
      },
    });
    if (!workspace) throw new NotFoundException("Workspace not found");
    return workspace;
  }

  async create(user: JwtUser, dto: CreateWorkspaceDto) {
    const { name } = dto;
    try {
      const workspace = await this.prismaService.workspace.create({
        data: {
          name,
          slug: generateSlug(name),
          members: {
            create: {
              role: WorkspaceRole.OWNER,
              userId: user.id,
            },
          },
        },
      });
      return workspace;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Workspace already exists");
      }

      throw error;
    }
  }

  async update(user: JwtUser, dto: UpdateWorkspaceDto, id: string) {
    await this.checkWorkspaceExistenceAndOwnership(user, id);

    if (!dto.name && !dto.slug) {
      throw new BadRequestException("Nothing to update");
    }

    const data: { name?: string; slug?: string } = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.slug) data.slug = normalizeSlug(dto.slug);

    try {
      return await this.prismaService.workspace.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Workspace URL is already taken");
      }
      throw error;
    }
  }

  async findById(user: JwtUser, id: string) {
    const workspace = await this.prismaService.workspace.findFirst({
      where: { id, members: { some: { userId: user.id } } },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: { userId: user.id },
          select: { role: true },
          take: 1,
        },
      },
    });
    if (!workspace) throw new NotFoundException("Workspace not found");

    const { members, ...rest } = workspace;
    return {
      ...rest,
      role: members[0]?.role ?? null,
    };
  }

  async findAll(user: JwtUser) {
    const workspaces = await this.prismaService.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        members: {
          where: { userId: user.id },
          select: { role: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return workspaces.map(({ members, ...workspace }) => ({
      ...workspace,
      role: members[0]?.role ?? null,
    }));
  }

  async deleteById(user: JwtUser, id: string) {
    await this.checkWorkspaceExistenceAndOwnership(user, id);
    await this.prismaService.workspace.delete({ where: { id } });
  }

  async listMembers(workspace: WorkspaceContext) {
    return this.prismaService.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async removeMember(
    workspace: WorkspaceContext,
    actor: JwtUser,
    membershipId: string,
  ) {
    const membership = await this.prismaService.workspaceMember.findFirst({
      where: { id: membershipId, workspaceId: workspace.id },
    });
    if (!membership) throw new NotFoundException("Member not found");

    if (membership.role === WorkspaceRole.OWNER) {
      throw new BadRequestException("Cannot remove the workspace owner");
    }

    if (membership.userId === actor.id) {
      throw new BadRequestException("You cannot remove yourself");
    }

    // Only OWNER can remove ADMIN; ADMIN can remove MEMBER
    if (
      membership.role === WorkspaceRole.ADMIN &&
      workspace.role !== WorkspaceRole.OWNER
    ) {
      throw new BadRequestException("Only the owner can remove admins");
    }

    await this.prismaService.workspaceMember.delete({
      where: { id: membershipId },
    });

    return { id: membershipId };
  }
}
