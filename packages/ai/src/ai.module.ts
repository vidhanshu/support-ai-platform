import { Module } from "@nestjs/common";
import { EmbeddingModule } from "./embedding/embedding.module";
import { LlmModule } from "./llm/llm.module";
import { PromptModule } from "./prompt/prompt.module";
import { CostModule } from "./cost/cost.module";
import { OllamaWarmupService } from "./ollama-warmup.service";

@Module({
  imports: [EmbeddingModule, LlmModule, PromptModule, CostModule],
  providers: [OllamaWarmupService],
  exports: [EmbeddingModule, LlmModule, PromptModule, CostModule],
})
export class AiModule {}
