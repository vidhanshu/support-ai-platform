import os from "os";
import { Injectable, Logger } from "@nestjs/common";
import { Document, KnowledgeSourceStatus, PrismaService } from "@repo/database";
import { StorageService } from "@repo/storage";
import { createWriteStream } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { stat, rm } from "fs/promises";
import { MIME_TYPE_TO_EXTENSION, MIME_TYPES } from "@repo/config";
import { EmbeddingService } from "@repo/ai";
import { VectorStoreService } from "@repo/vector-store";
import { ExtractedDocument } from "@repo/contracts";
import { ChunkingService, ExtractionService } from "@repo/knowledge";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
    private readonly embedService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly extractionService: ExtractionService,
    private readonly chunkingService: ChunkingService,
  ) {}

  async loadDocument(documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      this.logger.error(`Document not found for ${documentId}`);
      throw new Error(`Document not found for ${documentId}`);
    }
    return doc;
  }

  async downloadDocument(doc: Document) {
    const { stream } = await this.storage.downloadObject(doc.objectKey);
    const ext =
      MIME_TYPE_TO_EXTENSION[
        doc.mimeType as keyof typeof MIME_TYPE_TO_EXTENSION
      ];

    const tmpFile = path.join(os.tmpdir(), `${doc.id}${ext}`);

    await pipeline(stream, createWriteStream(tmpFile));

    const { size } = await stat(tmpFile);

    if (size !== doc.size) {
      this.logger.error(`Document size mismatch for ${doc.originalFilename}`);
      throw new Error("Document size mismatch");
    }

    this.logger.log(
      `Downloaded ${doc.originalFilename} to ${tmpFile} (${size} bytes)`,
    );

    return tmpFile;
  }

  async removeTemporaryFile(tmpFile: string) {
    await rm(tmpFile, { force: true });
  }

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

  async process(documentId: string) {
    let tmpFile: string | undefined;
    let knowledgeSourceId: string | null = null;
    try {
      // Load document
      const doc = await this.loadDocument(documentId);
      knowledgeSourceId = doc.knowledgeSourceId;

      // Download document
      tmpFile = await this.downloadDocument(doc);

      // Extract content based on MIME type
      let extractedContent: ExtractedDocument;
      switch (doc.mimeType) {
        case MIME_TYPES.PDF:
          extractedContent =
            await this.extractionService.extractPdfText(tmpFile);
          break;
        // TODO: Add support for other MIME types
        default:
          this.logger.error(`Unsupported MIME type: ${doc.mimeType}`);
          await this.updateKnowledgeSourceStatus(knowledgeSourceId, "failed");
          throw new Error(`Unsupported MIME type: ${doc.mimeType}`);
      }

      // Create chunks
      const chunks = await this.chunkingService.createChunks(extractedContent);

      // Embed chunks
      const embeddedChunks = await this.embedService.embedChunks(chunks);

      // Store embeddings
      await this.vectorStoreService.store(embeddedChunks, knowledgeSourceId);

      // Mark the knowledge source as ready
      await this.updateKnowledgeSourceStatus(knowledgeSourceId, "success");

      // just log the success
      this.logger.log(`Processed document ${documentId} successfully`);
    } catch (error) {
      console.log(error);
      this.logger.error(`Error processing document ${documentId}: ${error}`);
      if (knowledgeSourceId) {
        await this.updateKnowledgeSourceStatus(knowledgeSourceId, "failed");
      }
      throw error;
    } finally {
      if (tmpFile) {
        await this.removeTemporaryFile(tmpFile);
      }
    }
  }
}
