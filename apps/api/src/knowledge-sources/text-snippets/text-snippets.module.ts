import { Module } from "@nestjs/common";
import { TextSnippetsService } from "./text-snippets.service";
import { TextSnippetsController } from "./text-snippets.controller";
import { BullModule } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "@repo/config";
import { BillingModule } from "../../billing/billing.module";

@Module({
  imports: [
    BillingModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.TEXT_SNIPPET_PROCESSING,
    }),
  ],
  controllers: [TextSnippetsController],
  providers: [TextSnippetsService],
})
export class TextSnippetsModule {}
