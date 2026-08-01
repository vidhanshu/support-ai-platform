import { Injectable } from "@nestjs/common";
import type { ChatMessage } from "../llm/llm.types";

export type PromptBuildInput = {
  systemPrompt?: string | null;
  /** Prior turns from ConversationContextBuilder (no current user message) */
  history: ChatMessage[];
  /**
   * Pre-formatted retrieval context from packages/knowledge ContextBuilder.
   * PromptBuilder must not format raw chunks itself.
   */
  retrievedContext: string;
  userMessage: string;
};

export type PromptBuildResult = {
  messages: ChatMessage[];
  promptBuildMs: number;
};

/**
 * Assembles the final LLM message list.
 * Controllers/services must not concatenate prompt strings themselves.
 */
@Injectable()
export class PromptBuilder {
  build(input: PromptBuildInput): PromptBuildResult {
    const start = performance.now();

    const base =
      input.systemPrompt?.trim() || "You are a helpful AI assistant.";

    const systemContent = `${base}

Answer ONLY from the provided context.
If multiple sections discuss the same topic, combine the information.
If the answer is not present in the context, say you couldn't find it in the knowledge base.

Always answer in markdown.
If the user requests:
- a table → use a markdown table
- a list → use a markdown list
- code → use a fenced code block

Do not mention chunk numbers or internal IDs.
When citing sources, use page numbers like (Page 109) or the document title when available.

Context:
${input.retrievedContext}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...input.history,
      { role: "user", content: input.userMessage },
    ];

    return {
      messages,
      promptBuildMs: Math.round(performance.now() - start),
    };
  }
}
