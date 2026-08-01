import { VectorStoreService } from "@repo/vector-store";
import { Injectable, Logger } from "@nestjs/common";
import { Chunk, PrismaService } from "@repo/database";
import { EmbeddingService } from "@repo/ai";

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async retrieve(agentId: string, query: string) {
    try {
      this.logger.debug(`[retrieval] start agentId=${agentId}`);
      const knowledgeSources = await this.prisma.agentKnowledgeSource.findMany({
        where: { agentId },
      });
      const knowledgeSourceIds = knowledgeSources.map(
        (ks) => ks.knowledgeSourceId,
      );
      this.logger.debug(
        `[retrieval] knowledgeSources=${knowledgeSourceIds.length}`,
      );

      this.logger.debug(`[retrieval] embedding query`);
      const embeddedQuery = await this.embeddingService.embed(query);
      this.logger.debug(
        `[retrieval] embedding done dims=${embeddedQuery.length}`,
      );

      this.logger.debug(`[retrieval] vector search start`);
      const relevantChunks = await this.vectorStoreService.search(
        embeddedQuery,
        knowledgeSourceIds,
      );
      this.logger.debug(
        `[retrieval] vector search done chunks=${(relevantChunks as Chunk[]).length}`,
      );

      return relevantChunks as Chunk[];
    } catch (error) {
      console.error("[retrieval] failed", error);
      this.logger.error(
        `[retrieval] failed agentId=${agentId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
