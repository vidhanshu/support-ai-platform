import { Injectable } from "@nestjs/common";
import { MessageRole, PrismaService } from "@repo/database";
import { AI_CONFIGS } from "@repo/config";
import type { ChatMessage } from "../llm/llm.types";

export type ConversationContextResult = {
  messages: ChatMessage[];
  loadConversationMs: number;
};

/**
 * Loads recent conversation turns and maps them into LLM chat messages.
 * Excludes the current user message (already passed separately to PromptBuilder).
 */
@Injectable()
export class ConversationContextBuilder {
  constructor(private readonly prisma: PrismaService) {}

  async build(
    conversationId: string,
    options?: {
      excludeMessageId?: string;
      limit?: number;
    },
  ): Promise<ConversationContextResult> {
    const start = performance.now();
    const limit = options?.limit ?? AI_CONFIGS.MAX_CONTEXT_MESSAGES;

    const recent = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(options?.excludeMessageId
          ? { id: { not: options.excludeMessageId } }
          : {}),
        role: { in: [MessageRole.USER, MessageRole.ASSISTANT] },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        role: true,
        content: true,
      },
    });

    const chronological = recent.reverse();
    const messages: ChatMessage[] = chronological.map((message) => ({
      role:
        message.role === MessageRole.ASSISTANT
          ? ("assistant" as const)
          : ("user" as const),
      content: message.content,
    }));

    return {
      messages,
      loadConversationMs: Math.round(performance.now() - start),
    };
  }
}
