import { StorageModule } from '@repo/storage';
import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { DocumentProcessor } from "./documents.processor";
import { EmbeddingModule } from './embedding/embedding.module';

@Module({
  imports:[StorageModule, EmbeddingModule, EmbeddingModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentProcessor],
})
export class DocumentsModule {}
