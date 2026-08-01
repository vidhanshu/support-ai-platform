export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMGenerateOptions {
  messages: ChatMessage[];

  temperature?: number;

  model?: string;
}

export interface LLMProvider {
  generate(options: LLMGenerateOptions): Promise<string>;

  stream(options: LLMGenerateOptions): AsyncIterable<string>;
}
