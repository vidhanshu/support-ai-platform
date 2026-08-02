import { StorageModule } from "@repo/storage";
import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentProcessor } from "./documents.processor";
import { AiModule } from "@repo/ai";
import { VectorStoreModule } from "@repo/vector-store";
import { KnowledgeModule } from "@repo/knowledge";

@Module({
  imports: [StorageModule, AiModule, VectorStoreModule, KnowledgeModule],
  providers: [DocumentsService, DocumentProcessor],
})
export class DocumentsModule {}
