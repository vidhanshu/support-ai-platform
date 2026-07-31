import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { StorageModule } from "../storage/storage.module";
import { BullModule } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "@repo/config";

@Module({
  imports: [
    StorageModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.DOCUMENT_PROCESSING,
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
