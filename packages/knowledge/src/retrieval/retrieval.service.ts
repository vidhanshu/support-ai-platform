import { VectorStoreService } from "@repo/vector-store";
import { Injectable, Logger } from "@nestjs/common";
import { Chunk, KnowledgeSourceStatus, PrismaService } from "@repo/database";
import { EmbeddingService } from "@repo/ai";
import { AI_CONFIGS } from "@repo/config";

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async retrieve(
    agentId: string,
    query: string,
    limit: number = AI_CONFIGS.RETRIEVAL_TOP_K,
  ): Promise<{ chunks: Chunk[]; warning?: string }> {
    const totalStart = performance.now();

    try {
      let stepStart = performance.now();
      const knowledgeSources = await this.prisma.agentKnowledgeSource.findMany({
        where: {
          agentId,
          knowledgeSource: { status: KnowledgeSourceStatus.READY },
        },
      });
      const knowledgeSourceIds = knowledgeSources.map(
        (ks) => ks.knowledgeSourceId,
      );
      this.logger.log(
        `[perf] retrieval.load_sources=${this.elapsed(stepStart)}ms count=${knowledgeSourceIds.length} ids=${JSON.stringify(knowledgeSourceIds)}`,
      );

      if (knowledgeSourceIds.length === 0) {
        this.logger.warn(
          `[retrieval] agent ${agentId} has no attached knowledge sources`,
        );
        return {
          chunks: [],
          warning:
            "No knowledge sources attached to this agent. Attach one before chatting.",
        };
      }

      stepStart = performance.now();
      const embeddedQuery = await this.embeddingService.embed(query);
      this.logger.log(
        `[perf] retrieval.embed_query=${this.elapsed(stepStart)}ms dims=${embeddedQuery.length}`,
      );

      stepStart = performance.now();
      const relevantChunks = await this.vectorStoreService.search(
        embeddedQuery,
        knowledgeSourceIds,
        limit,
      );
      this.logger.log(
        `[perf] retrieval.vector_search=${this.elapsed(stepStart)}ms chunks=${relevantChunks.length} limit=${limit}`,
      );

      this.logger.log(`[perf] retrieval.total=${this.elapsed(totalStart)}ms`);

      return { chunks: relevantChunks as Chunk[] };
    } catch (error) {
      this.logger.error(
        `[perf] retrieval.failed after=${this.elapsed(totalStart)}ms`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private elapsed(start: number) {
    return Math.round(performance.now() - start);
  }
}
