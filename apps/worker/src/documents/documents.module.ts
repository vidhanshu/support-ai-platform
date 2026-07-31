import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { DocumentProcessor } from "./documents.processor";

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentProcessor],
})
export class DocumentsModule {}
