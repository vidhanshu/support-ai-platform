import { Module } from "@nestjs/common";
import { PrismaModule } from "@repo/database";
import { ConversationContextBuilder } from "./conversation-context.builder";
import { PromptBuilder } from "./prompt.builder";

@Module({
  imports: [PrismaModule],
  providers: [ConversationContextBuilder, PromptBuilder],
  exports: [ConversationContextBuilder, PromptBuilder],
})
export class PromptModule {}
