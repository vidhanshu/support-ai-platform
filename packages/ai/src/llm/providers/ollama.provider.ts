import { Ollama } from "ollama";
import type { LLMGenerateOptions, LLMProvider } from "../llm.types";

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

  async generate(options: LLMGenerateOptions) {
    const model = options.model ?? this.defaultModel;
    const start = performance.now();

    try {
      const response = await this.client.chat({
        model,
        messages: options.messages,
        keep_alive: KEEP_ALIVE,
        options: {
          temperature: options.temperature ?? 0.2,
          ...(options.numCtx ? { num_ctx: options.numCtx } : {}),
        },
      });

      console.log(
        `[perf] ollama.generate model=${model} total=${Math.round(performance.now() - start)}ms`,
      );

      return response.message.content ?? "";
    } catch (error) {
      console.error(
        `[perf] ollama.generate_failed model=${model} after=${Math.round(performance.now() - start)}ms`,
        error,
      );
      throw error;
    }
  }

  async *stream(options: LLMGenerateOptions) {
    const model = options.model ?? this.defaultModel;
    const start = performance.now();
    let firstTokenMs: number | null = null;
    let tokens = 0;

    try {
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

      console.log(
        `[perf] ollama.stream_request_opened model=${model} open=${Math.round(performance.now() - start)}ms`,
      );

      for await (const chunk of response) {
        const content = chunk.message.content;
        if (!content) continue;

        if (firstTokenMs === null) {
          firstTokenMs = Math.round(performance.now() - start);
          console.log(
            `[perf] ollama.stream_first_token model=${model} first_token=${firstTokenMs}ms`,
          );
        }

        tokens += 1;
        yield content;
      }

      console.log(
        `[perf] ollama.stream_done model=${model} total=${Math.round(performance.now() - start)}ms tokens=${tokens} first_token=${firstTokenMs ?? -1}ms`,
      );
    } catch (error) {
      console.error(
        `[perf] ollama.stream_failed model=${model} after=${Math.round(performance.now() - start)}ms`,
        error,
      );
      throw error;
    }
  }
}
