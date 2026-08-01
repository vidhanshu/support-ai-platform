import { Ollama } from "ollama";
import type { LLMGenerateOptions, LLMProvider } from "../llm.types";

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
    console.log("[ollama] generate start", {
      model,
      temperature: options.temperature ?? 0.2,
      messageCount: options.messages.length,
    });

    try {
      const response = await this.client.chat({
        model,
        messages: options.messages,
        options: {
          temperature: options.temperature ?? 0.2,
        },
      });

      console.log("[ollama] generate done", {
        model,
        contentLength: response.message.content?.length ?? 0,
      });

      return response.message.content ?? "";
    } catch (error) {
      console.error("[ollama] generate failed", { model, error });
      throw error;
    }
  }

  async *stream(options: LLMGenerateOptions) {
    const model = options.model ?? this.defaultModel;
    console.log("[ollama] stream start", {
      model,
      temperature: options.temperature ?? 0.2,
      messageCount: options.messages.length,
    });

    try {
      const response = await this.client.chat({
        model,
        messages: options.messages,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.2,
        },
      });

      for await (const chunk of response) {
        const content = chunk.message.content;
        if (content) {
          yield content;
        }
      }

      console.log("[ollama] stream done", { model });
    } catch (error) {
      console.error("[ollama] stream failed", { model, error });
      throw error;
    }
  }
}
