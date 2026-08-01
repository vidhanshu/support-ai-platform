import { RetrievalService } from "@repo/knowledge";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtUser } from "../auth/interfaces/jwt.interface";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import {
  Conversation,
  Message,
  MessageRole,
  PrismaService,
} from "@repo/database";
import { LlmService } from "@repo/ai";
import { AI_CONFIGS } from "@repo/config";
import { buildRAGPrompt, formatRetrievedContext } from "@repo/utils";
import type { ChatMessage } from "@repo/ai";

export type ChatSource = {
  id: string;
  text: string;
  metadata: unknown;
  knowledgeSourceId: string;
};

export type ChatStreamEvent =
  | {
      type: "meta";
      data: { conversationId: string; sources: ChatSource[] };
    }
  | { type: "token"; data: { content: string } }
  | { type: "done"; data: { message: Message } }
  | { type: "error"; data: { message: string } };

type PreparedChat = {
  conversation: Conversation;
  messages: ChatMessage[];
  model: string;
  temperature: number;
  sources: ChatSource[];
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly retrievalService: RetrievalService,
    private readonly llmService: LlmService,
  ) {}

  async *streamMessage(
    workspace: WorkspaceContext,
    _user: JwtUser,
    agentId: string,
    dto: SendMessageDto,
  ): AsyncGenerator<ChatStreamEvent> {
    const prepared = await this.prepareChat(workspace, agentId, dto);

    yield {
      type: "meta",
      data: {
        conversationId: prepared.conversation.id,
        sources: prepared.sources,
      },
    };

    this.logger.debug(
      `[chat] llm stream start model=${prepared.model} temperature=${prepared.temperature} messages=${prepared.messages.length}`,
    );

    let assistantContent = "";

    try {
      for await (const token of this.llmService.stream({
        messages: prepared.messages,
        model: prepared.model,
        temperature: prepared.temperature,
      })) {
        assistantContent += token;
        yield { type: "token", data: { content: token } };
      }

      const assistantMessage = await this.prismaService.message.create({
        data: {
          role: MessageRole.ASSISTANT,
          content: assistantContent,
          conversationId: prepared.conversation.id,
        },
      });

      this.logger.debug(
        `[chat] llm stream done responseLength=${assistantContent.length} messageId=${assistantMessage.id}`,
      );

      yield { type: "done", data: { message: assistantMessage } };
    } catch (error) {
      console.error("[chat] stream failed", error);
      this.logger.error(
        `[chat] stream failed agentId=${agentId}`,
        error instanceof Error ? error.stack : String(error),
      );
      yield {
        type: "error",
        data: {
          message:
            error instanceof Error ? error.message : "Failed to generate reply",
        },
      };
    }
  }

  private async prepareChat(
    workspace: WorkspaceContext,
    agentId: string,
    dto: SendMessageDto,
  ): Promise<PreparedChat> {
    const { message, conversationId } = dto;
    this.logger.debug(
      `[chat] start agentId=${agentId} workspaceId=${workspace.id} conversationId=${conversationId ?? "new"}`,
    );

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
          title: message.slice(0, 80),
        },
      });
    } else {
      conversation = await this.prismaService.conversation.findFirst({
        where: {
          id: conversationId,
          workspaceId: workspace.id,
          agentId,
        },
      });
    }

    if (!conversation) throw new NotFoundException("Conversation not found");

    await this.prismaService.message.create({
      data: {
        role: MessageRole.USER,
        content: message,
        conversationId: conversation.id,
      },
    });

    const relevantChunks = await this.retrievalService.retrieve(
      agentId,
      message,
    );
    this.logger.debug(`[chat] retrieval done chunks=${relevantChunks.length}`);

    const history = await this.prismaService.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: AI_CONFIGS.MAX_CONTEXT_MESSAGES,
    });

    const context = formatRetrievedContext(relevantChunks);
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: buildRAGPrompt(context, agent.systemPrompt),
      },
      ...history.map((item) => ({
        role:
          item.role === MessageRole.ASSISTANT
            ? ("assistant" as const)
            : ("user" as const),
        content: item.content,
      })),
    ];

    return {
      conversation,
      messages,
      model: agent.model ?? AI_CONFIGS.DEFAULT_CHAT_MODEL,
      temperature: agent.temperature ?? AI_CONFIGS.DEFAULT_TEMPERATURE,
      sources: relevantChunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        metadata: chunk.metadata,
        knowledgeSourceId: chunk.knowledgeSourceId,
      })),
    };
  }
}
