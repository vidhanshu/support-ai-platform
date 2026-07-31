import { Processor, WorkerHost } from "@nestjs/bullmq";
import { JOB_NAMES, QUEUE_NAMES } from "@repo/config";
import { Job } from "bullmq";
import { DocumentsService } from "./documents.service";

@Processor(QUEUE_NAMES.DOCUMENT_PROCESSING)
export class DocumentProcessor extends WorkerHost {
  constructor(private readonly documentService: DocumentsService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case JOB_NAMES.PROCESS_DOCUMENT:
        return this.documentService.process(job.data.documentId);

      default:
        throw new Error(`Unknown job ${job.name}`);
    }
  }
}
