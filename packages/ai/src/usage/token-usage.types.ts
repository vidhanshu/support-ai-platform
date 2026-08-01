import type { TokenUsage } from "../llm/llm.types";

export type { TokenUsage };

/**
 * Abstraction for normalizing provider-specific usage payloads.
 * OpenAI/Anthropic/Gemini adapters can implement this later.
 */
export interface TokenUsageExtractor<TRaw = unknown> {
  extract(raw: TRaw): TokenUsage;
}
