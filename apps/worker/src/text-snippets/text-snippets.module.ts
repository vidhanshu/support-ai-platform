import { Module } from "@nestjs/common";
import { AiModule } from "@repo/ai";
import { KnowledgeModule } from "@repo/knowledge";
import { VectorStoreModule } from "@repo/vector-store";
import { TextSnippetsService } from "./text-snippets.service";
import { TextSnippetProcessor } from "./text-snippet.processor";

@Module({
  imports: [AiModule, KnowledgeModule, VectorStoreModule],
  providers: [TextSnippetsService, TextSnippetProcessor],
})
export class TextSnippetsModule {}
