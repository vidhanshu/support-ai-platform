import { Inject, Injectable } from "@nestjs/common";
import type { LLMGenerateOptions, LLMProvider } from "./llm.types";
import { LLM_PROVIDER } from "./llm.constants";

@Injectable()
export class LlmService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly provider: LLMProvider,
  ) {}

  generate(options: LLMGenerateOptions) {
    return this.provider.generate(options);
  }

  stream(options: LLMGenerateOptions) {
    return this.provider.stream(options);
  }
}
