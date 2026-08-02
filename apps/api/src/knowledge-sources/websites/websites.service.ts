import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
  PrismaService,
} from "@repo/database";
import { WorkspaceContext } from "../../common/interfaces/request.interface";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { JOB_NAMES, QUEUE_NAMES, WEBSITE_CONFIGS } from "@repo/config";

@Injectable()
export class WebsitesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.WEBSITE_PROCESSING) private readonly queue: Queue,
  ) {}

  async create(
    workspace: WorkspaceContext,
    createWebsiteDto: CreateWebsiteDto,
  ) {
    let rootUrl: URL;
    try {
      rootUrl = new URL(createWebsiteDto.url);
    } catch {
      throw new BadRequestException("Invalid website URL");
    }

    if (rootUrl.protocol !== "http:" && rootUrl.protocol !== "https:") {
      throw new BadRequestException("Only http/https URLs are supported");
    }

    const maxPages = Math.min(
      createWebsiteDto.maxPages ?? WEBSITE_CONFIGS.DEFAULT_MAX_PAGES,
      WEBSITE_CONFIGS.MAX_ALLOWED_PAGES,
    );
    const maxDepth = Math.min(
      createWebsiteDto.maxDepth ?? WEBSITE_CONFIGS.DEFAULT_MAX_DEPTH,
      WEBSITE_CONFIGS.MAX_ALLOWED_DEPTH,
    );

    const ks = await this.prisma.knowledgeSource.create({
      data: {
        type: KnowledgeSourceType.WEBSITE,
        status: KnowledgeSourceStatus.PROCESSING,
        name: createWebsiteDto.name ?? rootUrl.hostname,
        workspaceId: workspace.id,
        website: {
          create: {
            rootUrl: rootUrl.toString(),
            allowedHosts: [rootUrl.hostname.toLowerCase()],
            maxPages,
            crawlDepth: maxDepth,
          },
        },
      },
      include: {
        website: true,
      },
    });

    if (ks.website?.id) {
      await this.queue.add(JOB_NAMES.CRAWL_WEBSITE, {
        websiteId: ks.website.id,
      });
    }

    return ks.website;
  }
}
