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
  | { type: "status"; data: { stage: string; ms?: number } }
  | {
      type: "meta";
      data: {
        conversationId: string;
        sources: ChatSource[];
        warning?: string;
      };
    }
  | { type: "token"; data: { content: string } }
  | {
      type: "done";
      data: { message: Message; sources: ChatSource[] };
    }
  | { type: "error"; data: { message: string } };

type PreparedChat = {
  conversation: Conversation;
  messages: ChatMessage[];
  model: string;
  temperature: number;
  sources: ChatSource[];
  warning?: string;
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
    const totalStart = performance.now();

    yield { type: "status", data: { stage: "started", ms: 0 } };

    const prepareStart = performance.now();
    const prepared = await this.prepareChat(workspace, agentId, dto);
    const prepareMs = this.elapsed(prepareStart);
    this.logger.log(
      `[perf] prepare_total=${prepareMs}ms sources=${prepared.sources.length}`,
    );
    yield { type: "status", data: { stage: "prepare_done", ms: prepareMs } };

    yield {
      type: "meta",
      data: {
        conversationId: prepared.conversation.id,
        sources: prepared.sources,
        ...(prepared.warning ? { warning: prepared.warning } : {}),
      },
    };

    let assistantContent = "";
    const streamStart = performance.now();
    let firstTokenMs: number | null = null;

    try {
      this.logger.log(
        `[perf] llm_stream_start model=${prepared.model} messages=${prepared.messages.length}`,
      );

      for await (const token of this.llmService.stream({
        messages: prepared.messages,
        model: prepared.model,
        temperature: prepared.temperature,
        numCtx: AI_CONFIGS.NUM_CTX,
      })) {
        if (firstTokenMs === null) {
          firstTokenMs = this.elapsed(streamStart);
          this.logger.log(`[perf] llm_first_token=${firstTokenMs}ms`);
          yield {
            type: "status",
            data: { stage: "first_token", ms: firstTokenMs },
          };
        }

        assistantContent += token;
        yield { type: "token", data: { content: token } };
      }

      const streamMs = this.elapsed(streamStart);
      this.logger.log(
        `[perf] llm_stream_total=${streamMs}ms responseLength=${assistantContent.length}`,
      );

      const saveStart = performance.now();
      const assistantMessage = await this.prismaService.message.create({
        data: {
          role: MessageRole.ASSISTANT,
          content: assistantContent,
          conversationId: prepared.conversation.id,
        },
      });
      this.logger.log(`[perf] save_assistant=${this.elapsed(saveStart)}ms`);

      this.logger.log(
        `[perf] summary total=${this.elapsed(totalStart)}ms prepare=${prepareMs}ms llm_first_token=${firstTokenMs ?? -1}ms llm_stream=${streamMs}ms`,
      );

      yield {
        type: "done",
        data: {
          message: assistantMessage,
          sources: prepared.sources,
        },
      };
    } catch (error) {
      this.logger.error(
        `[perf] stream_failed after=${this.elapsed(totalStart)}ms`,
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

    let stepStart = performance.now();
    const agent = await this.prismaService.agent.findFirst({
      where: { id: agentId, workspaceId: workspace.id },
    });
    this.logger.log(`[perf] load_agent=${this.elapsed(stepStart)}ms`);

    if (!agent) throw new NotFoundException("Agent not found");

    stepStart = performance.now();
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
    this.logger.log(
      `[perf] load_or_create_conversation=${this.elapsed(stepStart)}ms`,
    );

    if (!conversation) throw new NotFoundException("Conversation not found");

    stepStart = performance.now();
    await this.prismaService.message.create({
      data: {
        role: MessageRole.USER,
        content: message,
        conversationId: conversation.id,
      },
    });
    this.logger.log(`[perf] save_user_message=${this.elapsed(stepStart)}ms`);

    stepStart = performance.now();
    const { chunks: relevantChunks, warning } =
      await this.retrievalService.retrieve(agentId, message);
    this.logger.log(
      `[perf] retrieval_total=${this.elapsed(stepStart)}ms chunks=${relevantChunks.length}`,
    );

    stepStart = performance.now();
    const context = formatRetrievedContext(
      relevantChunks,
      AI_CONFIGS.MAX_CHUNK_CHARS,
    );

    // Only retrieved chunks + current question — no conversation history
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: buildRAGPrompt(context, agent.systemPrompt),
      },
      {
        role: "user",
        content: message,
      },
    ];

    const promptChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    this.logger.log(
      `[perf] build_prompt=${this.elapsed(stepStart)}ms contextChars=${context.length} promptChars=${promptChars} messages=${messages.length}`,
    );

    const sources = this.toSources(relevantChunks);
    this.logger.log(`[perf] sources_ready count=${sources.length}`);

    return {
      conversation,
      messages,
      model: agent.model ?? AI_CONFIGS.DEFAULT_CHAT_MODEL,
      temperature: agent.temperature ?? AI_CONFIGS.DEFAULT_TEMPERATURE,
      sources,
      warning,
    };
  }

  private toSources(
    chunks: Array<{
      id: string;
      text: string;
      metadata?: unknown;
      knowledgeSourceId: string;
    }>,
  ): ChatSource[] {
    return chunks.map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      metadata: chunk.metadata ?? null,
      knowledgeSourceId: chunk.knowledgeSourceId,
    }));
  }

  private elapsed(start: number) {
    return Math.round(performance.now() - start);
  }
}
