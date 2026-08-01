import { VectorStoreService } from "@repo/vector-store";
import { Injectable, Logger } from "@nestjs/common";
import { KnowledgeSourceStatus, PrismaService } from "@repo/database";
import { EmbeddingService } from "@repo/ai";
import { AI_CONFIGS } from "@repo/config";
import type {
  ChunkMetadata,
  KnowledgeSourceMetadata,
  RetrievedChunk,
} from "@repo/contracts";
import { applyMmr } from "./mmr";

export type RetrievalResult = {
  chunks: RetrievedChunk[];
  knowledgeSourceCount: number;
  candidateCount: number;
  retrievalMs: number;
  warning?: string;
};

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
  ): Promise<RetrievalResult> {
    const totalStart = performance.now();

    try {
      let stepStart = performance.now();
      const attachments = await this.prisma.agentKnowledgeSource.findMany({
        where: {
          agentId,
          knowledgeSource: { status: KnowledgeSourceStatus.READY },
        },
        include: {
          knowledgeSource: {
            select: {
              id: true,
              name: true,
              metadata: true,
            },
          },
        },
      });

      const knowledgeSourceIds = attachments.map((ks) => ks.knowledgeSourceId);
      const titleBySourceId = new Map(
        attachments.map((item) => {
          const meta = item.knowledgeSource.metadata as
            | KnowledgeSourceMetadata
            | null
            | undefined;
          const title =
            (typeof meta?.title === "string" && meta.title.trim()) ||
            item.knowledgeSource.name;
          return [item.knowledgeSourceId, title] as const;
        }),
      );

      this.logger.log(
        `[perf] retrieval.load_sources=${this.elapsed(stepStart)}ms count=${knowledgeSourceIds.length}`,
      );

      if (knowledgeSourceIds.length === 0) {
        this.logger.warn(
          `[retrieval] agent ${agentId} has no attached knowledge sources`,
        );
        return {
          chunks: [],
          knowledgeSourceCount: 0,
          candidateCount: 0,
          retrievalMs: this.elapsed(totalStart),
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
      const hits = await this.vectorStoreService.search(
        embeddedQuery,
        knowledgeSourceIds,
        AI_CONFIGS.RETRIEVAL_CANDIDATE_K,
      );
      this.logger.log(
        `[perf] retrieval.vector_search=${this.elapsed(stepStart)}ms candidates=${hits.length}`,
      );

      const scored: RetrievedChunk[] = hits.map((hit) => {
        const metadata = this.asChunkMetadata(hit.metadata);
        return {
          id: hit.id,
          text: hit.text,
          chunkIndex: hit.chunkIndex,
          knowledgeSourceId: hit.knowledgeSourceId,
          score: this.distanceToScore(Number(hit.distance)),
          pageNumber: metadata?.pageNumber,
          title: titleBySourceId.get(hit.knowledgeSourceId),
          metadata: metadata ?? null,
        };
      });

      const deduped = this.dedupeChunks(scored);
      const selected = applyMmr(
        deduped,
        limit,
        AI_CONFIGS.MMR_LAMBDA,
      );

      const retrievalMs = this.elapsed(totalStart);
      this.logger.log(
        `[perf] retrieval.total=${retrievalMs}ms candidates=${hits.length} deduped=${deduped.length} selected=${selected.length}`,
      );

      return {
        chunks: selected,
        knowledgeSourceCount: knowledgeSourceIds.length,
        candidateCount: hits.length,
        retrievalMs,
      };
    } catch (error) {
      this.logger.error(
        `[perf] retrieval.failed after=${this.elapsed(totalStart)}ms`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /** Keep highest-scoring chunk per source+page (or source+chunkIndex). */
  private dedupeChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
    const bestByKey = new Map<string, RetrievedChunk>();

    for (const chunk of chunks) {
      const key =
        chunk.pageNumber !== undefined
          ? `${chunk.knowledgeSourceId}:page:${chunk.pageNumber}`
          : `${chunk.knowledgeSourceId}:idx:${chunk.chunkIndex}`;

      const existing = bestByKey.get(key);
      if (!existing || chunk.score > existing.score) {
        bestByKey.set(key, chunk);
      }
    }

    return [...bestByKey.values()].sort((a, b) => b.score - a.score);
  }

  private distanceToScore(distance: number): number {
    if (!Number.isFinite(distance)) return 0;
    // pgvector cosine distance ≈ 1 - cosine_similarity
    return Math.max(0, Math.min(1, Number((1 - distance).toFixed(4))));
  }

  private asChunkMetadata(metadata: unknown): ChunkMetadata | undefined {
    if (!metadata || typeof metadata !== "object") return undefined;
    const pageNumber = (metadata as { pageNumber?: unknown }).pageNumber;
    if (typeof pageNumber === "number") {
      return { pageNumber };
    }
    return undefined;
  }

  private elapsed(start: number) {
    return Math.round(performance.now() - start);
  }
}
