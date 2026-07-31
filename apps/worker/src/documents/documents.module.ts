import { StorageModule } from '@repo/storage';
import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { DocumentProcessor } from "./documents.processor";
import { EmbeddingModule } from './embedding/embedding.module';
import { VectorStoreModule } from './vector-store/vector-store.module';

@Module({
  imports:[StorageModule, EmbeddingModule, EmbeddingModule, VectorStoreModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentProcessor],
})
export class DocumentsModule {}
