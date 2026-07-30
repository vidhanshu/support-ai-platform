import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import { JwtUser } from "../auth/interfaces/jwt.interface";
import { PrismaService } from "@repo/database";

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    workspace: WorkspaceContext,
    createAgentDto: CreateAgentDto,
    user: JwtUser,
  ) {
    const { id: workspaceId } = workspace;
    const { id: userId } = user;

    return this.prisma.agent.create({
      data: {
        workspaceId,
        createdById: userId,
        ...createAgentDto,
      },
    });
  }

  async findAll(workspace: WorkspaceContext) {
    return this.prisma.agent.findMany({
      where: {
        workspaceId: workspace.id,
      },
    });
  }

  async findOne(workspace: WorkspaceContext, id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: {
        id,
      },
    });

    if (!agent || agent.workspaceId !== workspace.id) {
      throw new NotFoundException("Agent not found");
    }

    return agent;
  }

  async update(
    workspace: WorkspaceContext,
    id: string,
    updateAgentDto: UpdateAgentDto,
  ) {
    await this.findOne(workspace, id);

    return this.prisma.agent.update({
      where: { id },
      data: updateAgentDto,
    });
  }

  async remove(workspace: WorkspaceContext, id: string) {
    await this.findOne(workspace, id);

    return this.prisma.agent.delete({
      where: { id },
    });
  }
}
