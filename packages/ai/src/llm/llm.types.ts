export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMGenerateOptions {
  messages: ChatMessage[];
  temperature?: number;
  model?: string;
  /** Ollama context window; lower values reduce memory/prefill cost */
  numCtx?: number;
}

/** Provider-reported token counts. Null when the provider does not expose usage. */
export type TokenUsage = {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
} | null;

export type LLMGenerateResult = {
  content: string;
  usage: TokenUsage;
};

export type LLMStreamPart =
  | { type: "token"; content: string }
  | { type: "done"; usage: TokenUsage };

export interface LLMProvider {
  generate(options: LLMGenerateOptions): Promise<LLMGenerateResult>;
  stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamPart>;
}
