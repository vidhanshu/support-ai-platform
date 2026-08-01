import { Module } from "@nestjs/common";
import { AiModule } from "@repo/ai";
import { VectorStoreModule } from "@repo/vector-store";
import { RetrievalService } from "./retrieval.service";
import { ContextBuilder } from "../context/context.builder";

@Module({
  imports: [AiModule, VectorStoreModule],
  providers: [RetrievalService, ContextBuilder],
  exports: [RetrievalService, ContextBuilder],
})
export class RetrievalModule {}
