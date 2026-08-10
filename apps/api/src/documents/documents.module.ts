import { StorageModule } from '@repo/storage';
import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { BullModule } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "@repo/config";
import { BillingModule } from "../billing/billing.module";

@Module({
  imports: [
    StorageModule,
    BillingModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.DOCUMENT_PROCESSING,
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
