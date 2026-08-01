import { Inject, Injectable } from "@nestjs/common";
import type {
  LLMGenerateOptions,
  LLMGenerateResult,
  LLMProvider,
  LLMStreamPart,
} from "./llm.types";
import { LLM_PROVIDER } from "./llm.constants";

@Injectable()
export class LlmService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly provider: LLMProvider,
  ) {}

  generate(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
    return this.provider.generate(options);
  }

  stream(options: LLMGenerateOptions): AsyncIterable<LLMStreamPart> {
    return this.provider.stream(options);
  }
}
