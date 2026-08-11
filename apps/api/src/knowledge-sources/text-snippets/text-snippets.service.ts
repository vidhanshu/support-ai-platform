import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTextSnippetDto } from "./dto/create-text-snippet.dto";
import {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
  PrismaService,
} from "@repo/database";
import { WorkspaceContext } from "../../common/interfaces/request.interface";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  JOB_NAMES,
  QUEUE_NAMES,
  TEXT_SNIPPET_CONFIGS,
} from "@repo/config";
import { htmlToPlainText, utf8ByteLength } from "@repo/knowledge";
import { PlanLimitsService } from "../../billing/plan-limits.service";

@Injectable()
export class TextSnippetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planLimits: PlanLimitsService,
    @InjectQueue(QUEUE_NAMES.TEXT_SNIPPET_PROCESSING)
    private readonly queue: Queue,
  ) {}

  async create(
    workspace: WorkspaceContext,
    dto: CreateTextSnippetDto,
  ) {
    await this.planLimits.assertCanCreateKnowledgeSource(workspace.id);

    const title = dto.title.trim();
    const contentHtml = dto.contentHtml.trim();
    if (!title) {
      throw new BadRequestException("Title is required");
    }
    if (!contentHtml) {
      throw new BadRequestException("Content is required");
    }

    const contentBytes = utf8ByteLength(contentHtml);
    if (contentBytes > TEXT_SNIPPET_CONFIGS.MAX_CONTENT_BYTES) {
      throw new BadRequestException(
        `Text snippet must be at most ${TEXT_SNIPPET_CONFIGS.MAX_CONTENT_BYTES} bytes`,
      );
    }

    const contentText = htmlToPlainText(contentHtml);
    if (contentText.length < TEXT_SNIPPET_CONFIGS.MIN_CONTENT_CHARS) {
      throw new BadRequestException("Text snippet content cannot be empty");
    }

    const ks = await this.prisma.knowledgeSource.create({
      data: {
        type: KnowledgeSourceType.TEXT_SNIPPET,
        status: KnowledgeSourceStatus.PROCESSING,
        name: title,
        workspaceId: workspace.id,
        textSnippet: {
          create: {
            title,
            contentHtml,
            contentText,
            contentBytes,
          },
        },
      },
      include: {
        textSnippet: true,
      },
    });

    if (ks.textSnippet?.id) {
      await this.queue.add(JOB_NAMES.PROCESS_TEXT_SNIPPET, {
        textSnippetId: ks.textSnippet.id,
      });
    }

    return ks;
  }
}
