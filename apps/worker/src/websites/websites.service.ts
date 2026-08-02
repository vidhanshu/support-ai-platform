import { Injectable, Logger } from "@nestjs/common";
import {
  KnowledgeSourceStatus,
  Prisma,
  PrismaService,
} from "@repo/database";
import { EmbeddingService } from "@repo/ai";
import { VectorStoreService } from "@repo/vector-store";
import {
  ChunkingService,
  CrawlService,
} from "@repo/knowledge";
import type { KnowledgeSourceMetadata } from "@repo/contracts";

@Injectable()
export class WebsitesService {
  private readonly logger = new Logger(WebsitesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crawlService: CrawlService,
    private readonly chunkingService: ChunkingService,
    private readonly embedService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async updateKnowledgeSourceStatus(
    knowledgeSourceId: string,
    type: "success" | "failed",
  ) {
    await this.prisma.knowledgeSource.update({
      where: { id: knowledgeSourceId },
      data: {
        status:
          type === "success"
            ? KnowledgeSourceStatus.READY
            : KnowledgeSourceStatus.FAILED,
      },
    });
  }

  async process(websiteId: string) {
    let knowledgeSourceId: string | null = null;

    try {
      const website = await this.prisma.website.findUnique({
        where: { id: websiteId },
        include: { knowledgeSource: true },
      });

      if (!website) {
        throw new Error(`Website ${websiteId} not found`);
      }

      knowledgeSourceId = website.knowledgeSourceId;

      const crawlResult = await this.crawlService.crawl({
        rootUrl: website.rootUrl,
        allowedHosts:
          website.allowedHosts.length > 0
            ? website.allowedHosts
            : undefined,
        maxPages: website.maxPages,
        maxDepth: website.crawlDepth,
      });

      if (crawlResult.pages.length === 0) {
        throw new Error(`No extractable pages found for ${website.rootUrl}`);
      }

      await this.prisma.website.update({
        where: { id: websiteId },
        data: {
          pagesFound: crawlResult.pagesFound,
          pagesCrawled: crawlResult.pagesCrawled,
          lastCrawledAt: new Date(),
          errorMessage: null,
          allowedHosts:
            website.allowedHosts.length > 0
              ? website.allowedHosts
              : [new URL(crawlResult.rootUrl).hostname],
        },
      });

      const sourceMetadata: KnowledgeSourceMetadata = {
        title: website.knowledgeSource.name,
        rootUrl: crawlResult.rootUrl,
        pageCount: crawlResult.pages.length,
      };

      await this.prisma.knowledgeSource.update({
        where: { id: knowledgeSourceId },
        data: {
          metadata: sourceMetadata as Prisma.InputJsonValue,
        },
      });

      // Replace previous chunks on re-crawl
      await this.prisma.chunk.deleteMany({
        where: { knowledgeSourceId },
      });

      const chunks = await this.chunkingService.createWebsiteChunks({
        pages: crawlResult.pages,
        metadata: sourceMetadata,
      });

      const embeddedChunks = await this.embedService.embedChunks(chunks);
      await this.vectorStoreService.store(embeddedChunks, knowledgeSourceId);

      await this.updateKnowledgeSourceStatus(knowledgeSourceId, "success");

      this.logger.log(
        `Processed website ${websiteId} pages=${crawlResult.pages.length} chunks=${chunks.length}`,
      );
    } catch (error) {
      this.logger.error(`Error processing website ${websiteId}`, error);

      if (knowledgeSourceId) {
        await this.updateKnowledgeSourceStatus(knowledgeSourceId, "failed");
        await this.prisma.website.update({
          where: { id: websiteId },
          data: {
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
        });
      }

      throw error;
    }
  }
}

