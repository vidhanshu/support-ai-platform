import { Module } from "@nestjs/common";
import { KnowledgeModule } from "@repo/knowledge";
import { AiModule } from "@repo/ai";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { BillingModule } from "../billing/billing.module";

@Module({
  imports: [KnowledgeModule, AiModule, BillingModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
