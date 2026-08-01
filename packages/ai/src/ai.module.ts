import { Module } from "@nestjs/common";
import { EmbeddingModule } from "./embedding/embedding.module";
import { LlmModule } from "./llm/llm.module";
import { OllamaWarmupService } from "./ollama-warmup.service";

@Module({
  imports: [EmbeddingModule, LlmModule],
  providers: [OllamaWarmupService],
  exports: [EmbeddingModule, LlmModule],
})
export class AiModule {}
