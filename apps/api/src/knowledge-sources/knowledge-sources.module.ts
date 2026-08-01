import { Module } from "@nestjs/common";
import { KnowledgeSourcesService } from "./knowledge-sources.service";
import { KnowledgeSourcesController } from "./knowledge-sources.controller";
import { StorageModule } from "@repo/storage";

@Module({
  imports: [StorageModule],
  controllers: [KnowledgeSourcesController],
  providers: [KnowledgeSourcesService],
})
export class KnowledgeSourcesModule {}
