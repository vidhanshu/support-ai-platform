import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { JOB_NAMES, QUEUE_NAMES } from "@repo/config";
import { Job } from "bullmq";
import { WebsitesService } from "./websites.service";

@Processor(QUEUE_NAMES.WEBSITE_PROCESSING)
export class WebsiteProcessor extends WorkerHost {
  private readonly logger = new Logger(WebsiteProcessor.name);

  constructor(private readonly websitesService: WebsitesService) {
    super();
  }

  async process(job: Job<{ websiteId: string }>) {
    switch (job.name) {
      case JOB_NAMES.CRAWL_WEBSITE:
        this.logger.log(`Processing website job ${job.id} websiteId=${job.data.websiteId}`);
        return this.websitesService.process(job.data.websiteId);
      default:
        throw new Error(`Unknown job ${job.name}`);
    }
  }
}
