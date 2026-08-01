import { Module } from "@nestjs/common";
import { AiModule } from "@repo/ai";
import { VectorStoreModule } from "@repo/vector-store";
import { RetrievalService } from "./retrieval.service";

@Module({
  imports: [AiModule, VectorStoreModule],
  providers: [RetrievalService],
  exports: [RetrievalService],
})
export class RetrievalModule {}
