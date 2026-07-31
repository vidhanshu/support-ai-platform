import { Injectable, NotFoundException } from "@nestjs/common";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtUser } from "../auth/interfaces/jwt.interface";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import { Conversation, MessageRole, PrismaService } from "@repo/database";

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendMessage(
    workspace: WorkspaceContext,
    user: JwtUser,
    agentId: string,
    dto: SendMessageDto,
  ) {
    const { message, conversationId } = dto;
    const agent = await this.prismaService.agent.findFirst({
      where: { id: agentId, workspaceId: workspace.id },
    });

    if (!agent) throw new NotFoundException("Agent not found");

    let conversation: Conversation | null = null;
    if (!conversationId) {
      conversation = await this.prismaService.conversation.create({
        data: {
          agentId,
          workspaceId: workspace.id,
        },
      });
    } else {
      conversation = await this.prismaService.conversation.findUnique({
        where: { id: conversationId, workspaceId: workspace.id },
      });
    }

    if (!conversation) throw new NotFoundException("Conversation not found");

    const dbMessage = await this.prismaService.message.create({
      data: {
        role: MessageRole.USER,
        content: message,
        conversationId: conversation.id,
      },
    });

    return dbMessage;
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
