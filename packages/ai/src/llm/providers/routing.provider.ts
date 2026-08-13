import { isOllamaAgentModel } from "@repo/config";
import type {
  LLMGenerateOptions,
  LLMGenerateResult,
  LLMProvider,
  LLMStreamPart,
} from "../llm.types";

/**
 * Routes each request by model id: Ollama models → local, everything else → Groq.
 */
export class RoutingLlmProvider implements LLMProvider {
  constructor(
    private readonly groq: LLMProvider,
    private readonly ollama: LLMProvider,
    private readonly defaultModel: string,
  ) {}

  private resolve(options: LLMGenerateOptions): LLMProvider {
    const model = options.model ?? this.defaultModel;
    return isOllamaAgentModel(model) ? this.ollama : this.groq;
  }

  generate(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
    return this.resolve(options).generate(options);
  }

  stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamPart> {
    return this.resolve(options).stream(options);
  }
}
