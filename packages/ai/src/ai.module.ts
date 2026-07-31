import { Module } from "@nestjs/common";
import { EmbeddingModule } from "./embedding/embedding.module";
import { LlmModule } from "./llm/llm.module";

@Module({
  imports: [EmbeddingModule, LlmModule],
  exports: [EmbeddingModule, LlmModule],
})
export class AiModule {}
