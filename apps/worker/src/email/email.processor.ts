import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { JOB_NAMES, QUEUE_NAMES } from "@repo/config";
import { EmailService, type EmailJobPayload } from "@repo/email";
import { Job } from "bullmq";

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobPayload>) {
    switch (job.name) {
      case JOB_NAMES.SEND_EMAIL:
        this.logger.log(
          `Processing email job ${job.id} kind=${job.data.kind} to=${job.data.to}`,
        );
        return this.emailService.sendFromJob(job.data);
      default:
        throw new Error(`Unknown job ${job.name}`);
    }
  }
}
