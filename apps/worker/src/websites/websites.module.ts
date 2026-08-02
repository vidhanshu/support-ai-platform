import { Module } from "@nestjs/common";
import { AiModule } from "@repo/ai";
import { KnowledgeModule } from "@repo/knowledge";
import { VectorStoreModule } from "@repo/vector-store";
import { WebsitesService } from "./websites.service";
import { WebsiteProcessor } from "./website.processor";

@Module({
  imports: [AiModule, KnowledgeModule, VectorStoreModule],
  providers: [WebsitesService, WebsiteProcessor],
})
export class WebsitesModule {}
