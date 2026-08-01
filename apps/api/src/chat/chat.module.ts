import { Module } from "@nestjs/common";
import { KnowledgeModule } from "@repo/knowledge";
import { AiModule } from "@repo/ai";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";

@Module({
  imports: [KnowledgeModule, AiModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
