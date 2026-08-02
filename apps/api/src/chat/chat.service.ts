import {
  ContextBuilder,
  RetrievalService,
} from "@repo/knowledge";
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
import {
  ConversationContextBuilder,
  DefaultCostCalculator,
  LlmService,
  PromptBuilder,
  type ChatMessage,
  type TokenUsage,
} from "@repo/ai";
import { AI_CONFIGS } from "@repo/config";

export type ChatSource = {
  id: string;
  text: string;
  knowledgeSourceId: string;
  pageNumber?: number;
  url?: string;
  title?: string;
  score: number;
  metadata?: { pageNumber?: number; url?: string; title?: string } | null;
};

export type ChatPipelineTimings = {
  loadConversationMs: number;
  embeddingMs: number;
  retrievalMs: number;
  rerankingMs: number;
  contextBuildMs: number;
  promptBuildMs: number;
  llmFirstTokenMs: number | null;
  llmGenerationMs: number;
  totalRequestMs: number;
};

export type ChatStreamEvent =
  | { type: "status"; data: { stage: string; ms?: number } }
  | {
      type: "retrieval";
      data: {
        chunks: number;
        knowledgeSources: number;
        candidates: number;
        embeddingMs: number;
        retrievalMs: number;
        rerankingMs: number;
      };
    }
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
      data: {
        message: Message;
        sources: ChatSource[];
        timings: ChatPipelineTimings;
        usage: TokenUsage;
        estimatedCost: number | null;
      };
    }
  | { type: "error"; data: { message: string } };

type PreparedChat = {
  conversation: Conversation;
  messages: ChatMessage[];
  model: string;
  temperature: number;
  sources: ChatSource[];
  timings: Omit<
    ChatPipelineTimings,
    "llmFirstTokenMs" | "llmGenerationMs" | "totalRequestMs"
  >;
  knowledgeSourceCount: number;
  candidateCount: number;
  warning?: string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly retrievalService: RetrievalService,
    private readonly contextBuilder: ContextBuilder,
    private readonly conversationContextBuilder: ConversationContextBuilder,
    private readonly promptBuilder: PromptBuilder,
    private readonly llmService: LlmService,
    private readonly costCalculator: DefaultCostCalculator,
  ) {}

  async *streamMessage(
    workspace: WorkspaceContext,
    _user: JwtUser,
    agentId: string,
    dto: SendMessageDto,
  ): AsyncGenerator<ChatStreamEvent> {
    const totalStart = performance.now();

    yield { type: "status", data: { stage: "started", ms: 0 } };
    yield { type: "status", data: { stage: "retrieving" } };

    const prepared = await this.prepareChat(workspace, agentId, dto);

    yield {
      type: "retrieval",
      data: {
        chunks: prepared.sources.length,
        knowledgeSources: prepared.knowledgeSourceCount,
        candidates: prepared.candidateCount,
        embeddingMs: prepared.timings.embeddingMs,
        retrievalMs: prepared.timings.retrievalMs,
        rerankingMs: prepared.timings.rerankingMs,
      },
    };

    yield {
      type: "meta",
      data: {
        conversationId: prepared.conversation.id,
        sources: prepared.sources,
        ...(prepared.warning ? { warning: prepared.warning } : {}),
      },
    };

    yield { type: "status", data: { stage: "generating" } };

    let assistantContent = "";
    let usage: TokenUsage = null;
    const streamStart = performance.now();
    let firstTokenMs: number | null = null;

    try {
      for await (const part of this.llmService.stream({
        messages: prepared.messages,
        model: prepared.model,
        temperature: prepared.temperature,
        numCtx: AI_CONFIGS.NUM_CTX,
      })) {
        if (part.type === "token") {
          if (firstTokenMs === null) {
            firstTokenMs = this.elapsed(streamStart);
            yield {
              type: "status",
              data: { stage: "first_token", ms: firstTokenMs },
            };
          }
          assistantContent += part.content;
          yield { type: "token", data: { content: part.content } };
          continue;
        }

        usage = part.usage;
      }

      const llmGenerationMs = this.elapsed(streamStart);

      const assistantMessage = await this.prismaService.message.create({
        data: {
          role: MessageRole.ASSISTANT,
          content: assistantContent,
          conversationId: prepared.conversation.id,
        },
      });

      const totalRequestMs = this.elapsed(totalStart);
      const timings: ChatPipelineTimings = {
        ...prepared.timings,
        llmFirstTokenMs: firstTokenMs,
        llmGenerationMs,
        totalRequestMs,
      };

      const estimatedCost = this.costCalculator.estimate({
        provider: "ollama",
        model: prepared.model,
        usage,
      });

      this.logger.log({
        msg: "chat.pipeline.complete",
        conversationId: prepared.conversation.id,
        agentId,
        model: prepared.model,
        timings,
        usage,
        estimatedCost,
        sourceCount: prepared.sources.length,
      });

      yield {
        type: "done",
        data: {
          message: assistantMessage,
          sources: prepared.sources,
          timings,
          usage,
          estimatedCost,
        },
      };
    } catch (error) {
      this.logger.error(
        {
          msg: "chat.pipeline.failed",
          agentId,
          afterMs: this.elapsed(totalStart),
        },
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

    const userMessage = await this.prismaService.message.create({
      data: {
        role: MessageRole.USER,
        content: message,
        conversationId: conversation.id,
      },
    });

    const historyResult = await this.conversationContextBuilder.build(
      conversation.id,
      { excludeMessageId: userMessage.id },
    );

    const retrieval = await this.retrievalService.retrieve(agentId, message);

    const { context, contextBuildMs } = this.contextBuilder.build(
      retrieval.chunks,
    );

    const { messages, promptBuildMs } = this.promptBuilder.build({
      systemPrompt: agent.systemPrompt,
      history: historyResult.messages,
      retrievedContext: context,
      userMessage: message,
    });

    return {
      conversation,
      messages,
      model: agent.model ?? AI_CONFIGS.DEFAULT_CHAT_MODEL,
      temperature: agent.temperature ?? AI_CONFIGS.DEFAULT_TEMPERATURE,
      sources: retrieval.chunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        knowledgeSourceId: chunk.knowledgeSourceId,
        pageNumber: chunk.pageNumber,
        url: chunk.url,
        title: chunk.title,
        score: chunk.score,
        metadata: chunk.metadata ?? null,
      })),
      timings: {
        loadConversationMs: historyResult.loadConversationMs,
        embeddingMs: retrieval.timings.embeddingMs,
        retrievalMs: retrieval.timings.retrievalMs,
        rerankingMs: retrieval.timings.rerankingMs,
        contextBuildMs,
        promptBuildMs,
      },
      knowledgeSourceCount: retrieval.knowledgeSourceCount,
      candidateCount: retrieval.candidateCount,
      warning: retrieval.warning,
    };
  }

  private elapsed(start: number) {
    return Math.round(performance.now() - start);
  }
}
