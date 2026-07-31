import { Processor, WorkerHost } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "@repo/config";
import { Job } from "bullmq";
import { DocumentsService } from "./documents.service";

@Processor(QUEUE_NAMES.DOCUMENT_PROCESSING)
export class DocumentProcessor extends WorkerHost {
  constructor(private readonly documentService: DocumentsService) {
    super();
  }

  async process(job: Job) {
    this.documentService.process(job.data);
  }
}
