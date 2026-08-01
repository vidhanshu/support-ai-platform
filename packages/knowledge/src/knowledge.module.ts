import { Module } from "@nestjs/common";
import { ExtractionModule } from "./extraction/extraction.module";
import { ChunkingModule } from "./chunking/chunking.module";
import { RetrievalModule } from "./retrieval/retrieval.module";
import { AiModule } from "@repo/ai";
@Module({
  imports: [ExtractionModule, ChunkingModule, RetrievalModule, AiModule],
  exports: [ExtractionModule, ChunkingModule, RetrievalModule],
})
export class KnowledgeModule {}
