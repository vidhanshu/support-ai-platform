import type {
  LLMGenerateOptions,
  LLMGenerateResult,
  LLMProvider,
  LLMStreamPart,
  TokenUsage,
} from "../llm.types";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

type GroqChatChoiceMessage = {
  content?: string | null;
};

type GroqChatResponse = {
  choices?: Array<{ message?: GroqChatChoiceMessage; delta?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

function toUsage(usage: GroqChatResponse["usage"]): TokenUsage {
  if (!usage) return null;
  return {
    promptTokens: usage.prompt_tokens ?? null,
    completionTokens: usage.completion_tokens ?? null,
    totalTokens: usage.total_tokens ?? null,
  };
}

export class GroqProvider implements LLMProvider {
  constructor(
    private readonly apiKey: string,
    private readonly defaultModel: string,
  ) {}

  async generate(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
    const model = options.model ?? this.defaultModel;
    const response = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.2,
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq chat failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as GroqChatResponse;
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      usage: toUsage(data.usage),
    };
  }

  async *stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamPart> {
    const model = options.model ?? this.defaultModel;
    const response = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.2,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const body = await response.text();
      throw new Error(`Groq stream failed (${response.status}): ${body}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let usage: TokenUsage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        let chunk: GroqChatResponse;
        try {
          chunk = JSON.parse(payload) as GroqChatResponse;
        } catch {
          continue;
        }

        if (chunk.usage) {
          usage = toUsage(chunk.usage);
        }

        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          yield { type: "token", content };
        }
      }
    }

    yield { type: "done", usage };
  }
}
