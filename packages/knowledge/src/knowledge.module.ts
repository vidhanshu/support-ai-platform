import { Module } from "@nestjs/common";
import { ExtractionModule } from "./extraction/extraction.module";
import { ChunkingModule } from "./chunking/chunking.module";

@Module({
  imports: [ExtractionModule, ChunkingModule],
  exports: [ExtractionModule, ChunkingModule],
})
export class KnowledgeModule {}
