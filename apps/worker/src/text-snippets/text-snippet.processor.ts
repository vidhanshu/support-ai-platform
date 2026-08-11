import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { JOB_NAMES, QUEUE_NAMES } from "@repo/config";
import { Job } from "bullmq";
import { TextSnippetsService } from "./text-snippets.service";

@Processor(QUEUE_NAMES.TEXT_SNIPPET_PROCESSING)
export class TextSnippetProcessor extends WorkerHost {
  private readonly logger = new Logger(TextSnippetProcessor.name);

  constructor(private readonly textSnippetsService: TextSnippetsService) {
    super();
  }

  async process(job: Job<{ textSnippetId: string }>) {
    switch (job.name) {
      case JOB_NAMES.PROCESS_TEXT_SNIPPET:
        this.logger.log(
          `Processing text snippet job ${job.id} textSnippetId=${job.data.textSnippetId}`,
        );
        return this.textSnippetsService.process(job.data.textSnippetId);
      default:
        throw new Error(`Unknown job ${job.name}`);
    }
  }
}
