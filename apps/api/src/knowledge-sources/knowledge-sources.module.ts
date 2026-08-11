import { Module } from "@nestjs/common";
import { KnowledgeSourcesService } from "./knowledge-sources.service";
import { KnowledgeSourcesController } from "./knowledge-sources.controller";
import { StorageModule } from "@repo/storage";
import { WebsitesModule } from "./websites/websites.module";
import { TextSnippetsModule } from "./text-snippets/text-snippets.module";

@Module({
  imports: [StorageModule, WebsitesModule, TextSnippetsModule],
  controllers: [KnowledgeSourcesController],
  providers: [KnowledgeSourcesService],
})
export class KnowledgeSourcesModule {}
