import { Module } from "@nestjs/common";
import { WebsitesService } from "./websites.service";
import { WebsitesController } from "./websites.controller";
import { BullModule } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "@repo/config";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.WEBSITE_PROCESSING,
    }),
  ],
  controllers: [WebsitesController],
  providers: [WebsitesService],
})
export class WebsitesModule {}
