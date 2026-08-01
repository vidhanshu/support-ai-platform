import { Ollama } from "ollama";
import type {
  LLMGenerateOptions,
  LLMGenerateResult,
  LLMProvider,
  LLMStreamPart,
} from "../llm.types";

/** Keep models loaded indefinitely to avoid multi-second reload costs. */
const KEEP_ALIVE = -1;

export class OllamaProvider implements LLMProvider {
  private readonly client: Ollama;

  constructor(
    baseUrl: string,
    private readonly defaultModel: string,
  ) {
    this.client = new Ollama({ host: baseUrl });
  }

  async generate(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
    const model = options.model ?? this.defaultModel;

    const response = await this.client.chat({
      model,
      messages: options.messages,
      keep_alive: KEEP_ALIVE,
      options: {
        temperature: options.temperature ?? 0.2,
        ...(options.numCtx ? { num_ctx: options.numCtx } : {}),
      },
    });

    return {
      content: response.message.content ?? "",
      // Local Ollama has no billed usage API — keep null for provider-agnostic clients.
      usage: null,
    };
  }

  async *stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamPart> {
    const model = options.model ?? this.defaultModel;

    const response = await this.client.chat({
      model,
      messages: options.messages,
      stream: true,
      keep_alive: KEEP_ALIVE,
      options: {
        temperature: options.temperature ?? 0.2,
        ...(options.numCtx ? { num_ctx: options.numCtx } : {}),
      },
    });

    for await (const chunk of response) {
      const content = chunk.message.content;
      if (content) {
        yield { type: "token", content };
      }
    }

    yield { type: "done", usage: null };
  }
}
