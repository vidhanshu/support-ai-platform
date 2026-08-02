import { Module } from "@nestjs/common";
import { ExtractionModule } from "./extraction/extraction.module";
import { ChunkingModule } from "./chunking/chunking.module";
import { RetrievalModule } from "./retrieval/retrieval.module";
import { AiModule } from "@repo/ai";
import { CrawlModule } from "./crawl/crawl.module";

@Module({
  imports: [
    ExtractionModule,
    ChunkingModule,
    RetrievalModule,
    AiModule,
    CrawlModule,
  ],
  exports: [
    ExtractionModule,
    ChunkingModule,
    RetrievalModule,
    CrawlModule,
  ],
})
export class KnowledgeModule {}
