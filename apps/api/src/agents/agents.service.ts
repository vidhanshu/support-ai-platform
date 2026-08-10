import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import { JwtUser } from "../auth/interfaces/jwt.interface";
import { PrismaService } from "@repo/database";
import { PlanLimitsService } from "../billing/plan-limits.service";

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async create(
    workspace: WorkspaceContext,
    createAgentDto: CreateAgentDto,
    user: JwtUser,
  ) {
    const { id: workspaceId } = workspace;
    const { id: userId } = user;

    await this.planLimits.assertCanCreateAgent(workspaceId);

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
      include: {
        knowledgeSources: {
          include: {
            knowledgeSource: {
              include: {
                document: true,
                website: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
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

  async attachKnowledgeSource(
    workspace: WorkspaceContext,
    user: JwtUser,
    agentId: string,
    knowledgeSourceId: string,
  ) {
    const knowledgeSource = await this.prisma.knowledgeSource.findUnique({
      where: {
        id: knowledgeSourceId,
      },
    });

    if (!knowledgeSource || knowledgeSource.workspaceId !== workspace.id) {
      throw new NotFoundException("Knowledge source not found");
    }

    const agent = await this.findOne(workspace, agentId);

    const agentKnowledgeSource =
      await this.prisma.agentKnowledgeSource.findUnique({
        where: {
          agentId_knowledgeSourceId: {
            agentId,
            knowledgeSourceId,
          },
        },
      });

    if (agentKnowledgeSource) {
      throw new BadRequestException(
        "Knowledge source already attached to agent",
      );
    }

    return this.prisma.agentKnowledgeSource.create({
      data: {
        agentId: agent.id,
        knowledgeSourceId: knowledgeSource.id,
        attachedById: user.id,
      },
    });
  }

  async detachKnowledgeSource(
    workspace: WorkspaceContext,
    agentId: string,
    knowledgeSourceId: string,
  ) {
    const agentKnowledgeSource =
      await this.prisma.agentKnowledgeSource.findUnique({
        where: {
          agentId_knowledgeSourceId: {
            agentId,
            knowledgeSourceId,
          },
        },
        include: {
          agent: {
            select: { workspaceId: true },
          },
          knowledgeSource: {
            select: { workspaceId: true },
          },
        },
      });

    if (
      !agentKnowledgeSource ||
      agentKnowledgeSource.agent.workspaceId !== workspace.id ||
      agentKnowledgeSource.knowledgeSource.workspaceId !== workspace.id
    ) {
      throw new NotFoundException("Agent knowledge source not found");
    }

    return this.prisma.agentKnowledgeSource.delete({
      where: {
        id: agentKnowledgeSource.id,
      },
    });
  }
}
