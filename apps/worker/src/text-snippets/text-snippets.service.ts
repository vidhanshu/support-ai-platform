import { Injectable, Logger } from "@nestjs/common";
import {
  KnowledgeSourceStatus,
  Prisma,
  PrismaService,
} from "@repo/database";
import { EmbeddingService } from "@repo/ai";
import { VectorStoreService } from "@repo/vector-store";
import { ChunkingService } from "@repo/knowledge";
import type { KnowledgeSourceMetadata } from "@repo/contracts";

@Injectable()
export class TextSnippetsService {
  private readonly logger = new Logger(TextSnippetsService.name);

  constructor(
    private readonly prisma: PrismaService,
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

  async process(textSnippetId: string) {
    let knowledgeSourceId: string | null = null;

    try {
      const snippet = await this.prisma.textSnippet.findUnique({
        where: { id: textSnippetId },
        include: { knowledgeSource: true },
      });

      if (!snippet) {
        throw new Error(`Text snippet ${textSnippetId} not found`);
      }

      knowledgeSourceId = snippet.knowledgeSourceId;

      if (!snippet.contentText.trim()) {
        throw new Error("Text snippet has no extractable content");
      }

      const sourceMetadata: KnowledgeSourceMetadata = {
        title: snippet.title,
      };

      await this.prisma.knowledgeSource.update({
        where: { id: knowledgeSourceId },
        data: {
          metadata: sourceMetadata as Prisma.InputJsonValue,
        },
      });

      // Clear any previous chunks (reprocess-safe)
      await this.prisma.chunk.deleteMany({
        where: { knowledgeSourceId },
      });

      const chunks = await this.chunkingService.createTextSnippetChunks({
        title: snippet.title,
        text: snippet.contentText,
        metadata: sourceMetadata,
      });

      if (chunks.length === 0) {
        throw new Error("No chunks produced from text snippet");
      }

      const embeddedChunks = await this.embedService.embedChunks(chunks);
      await this.vectorStoreService.store(embeddedChunks, knowledgeSourceId);

      await this.prisma.textSnippet.update({
        where: { id: textSnippetId },
        data: { errorMessage: null },
      });

      await this.updateKnowledgeSourceStatus(knowledgeSourceId, "success");

      this.logger.log(
        `Processed text snippet ${textSnippetId} chunks=${chunks.length}`,
      );
    } catch (error) {
      this.logger.error(`Error processing text snippet ${textSnippetId}`, error);

      if (knowledgeSourceId) {
        await this.updateKnowledgeSourceStatus(knowledgeSourceId, "failed");
        await this.prisma.textSnippet.update({
          where: { id: textSnippetId },
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
