import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@repo/database";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import type { BulkDeleteConversationsDto } from "./dto/bulk-delete-conversations.dto";

@Injectable()
export class ConversationService {
  constructor(private readonly prismaService: PrismaService) {}

  async listByAgent(workspace: WorkspaceContext, agentId: string) {
    const agent = await this.prismaService.agent.findFirst({
      where: { id: agentId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!agent) throw new NotFoundException("Agent not found");

    const conversations = await this.prismaService.conversation.findMany({
      where: {
        workspaceId: workspace.id,
        agentId,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return conversations.map(({ messages, _count, ...conversation }) => ({
      ...conversation,
      lastMessage: messages[0] ?? null,
      messageCount: _count.messages,
    }));
  }

  async findOne(workspace: WorkspaceContext, id: string) {
    const conversation = await this.prismaService.conversation.findFirst({
      where: { id, workspaceId: workspace.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) throw new NotFoundException("Conversation not found");

    return conversation;
  }

  async removeMany(
    workspace: WorkspaceContext,
    dto: BulkDeleteConversationsDto,
  ) {
    const agent = await this.prismaService.agent.findFirst({
      where: { id: dto.agentId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!agent) throw new NotFoundException("Agent not found");

    const uniqueIds = [...new Set(dto.ids)];

    const result = await this.prismaService.conversation.deleteMany({
      where: {
        workspaceId: workspace.id,
        agentId: dto.agentId,
        id: { in: uniqueIds },
      },
    });

    return {
      deletedCount: result.count,
      ids: uniqueIds,
    };
  }
}
