import {
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
import { generateSlug } from "./utils";
import { UpdateWorkspaceDto } from "./dtos/update-workspace.dto";

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

  async createWorkspace(user: JwtUser, dto: CreateWorkspaceDto) {
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

  async updateWorkspace(user: JwtUser, dto: UpdateWorkspaceDto, id: string) {
    await this.checkWorkspaceExistenceAndOwnership(user, id);

    return this.prismaService.workspace.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async workspaceById(user: JwtUser, id: string) {
    const workspace = await this.prismaService.workspace.findFirst({
      where: { id, members: { some: { userId: user.id } } },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    if (!workspace) throw new NotFoundException("Workspace not found");
    return workspace;
  }

  async workspaces(user: JwtUser) {
    return this.prismaService.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
    });
  }

  async deleteWorkspace(user: JwtUser, id: string) {
    await this.checkWorkspaceExistenceAndOwnership(user, id);
    await this.prismaService.workspace.delete({ where: { id } });
  }
}
