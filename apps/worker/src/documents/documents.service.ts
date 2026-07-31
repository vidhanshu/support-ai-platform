import os from "os";
import { Injectable, Logger } from "@nestjs/common";
import {
  Document,
  DocumentStatus,
  PrismaService,
} from "@repo/database";
import { StorageService } from "@repo/storage";
import { createWriteStream } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { stat, rm } from "fs/promises";
import { MIME_TYPE_TO_EXTENSION, MIME_TYPES } from "@repo/config";
import { Chunk, ExtractedDocument } from "../interfaces";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { EmbeddingService } from "./embedding/embedding.service";
import { VectorStoreService } from "./vector-store/vector-store.service";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
    private readonly embedService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
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
      this.logger.error(`Document size mismatch for ${doc.name}`);
      throw new Error("Document size mismatch");
    }

    this.logger.log(`Downloaded ${doc.name} to ${tmpFile} (${size} bytes)`);

    return tmpFile;
  }

  async extractPdfText(tmpFile: string): Promise<ExtractedDocument> {
    const loader = new PDFLoader(tmpFile);
    const docs = await loader.load();

    if (docs.length === 0) {
      this.logger.error(`No text found in PDF ${tmpFile}`);
      throw new Error(`No text found in PDF ${tmpFile}`);
    }
    const text = docs.map((doc) => doc.pageContent).join("\n");

    return {
      text,
      metadata: {
        pageCount: docs.length,
      },
    };
  }

  async createChunks(extractedDocument: ExtractedDocument): Promise<Chunk[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(extractedDocument.text);

    return chunks.map((chunk, index) => ({
      text: chunk,
      index,
    }));
  }

  async removeTemporaryFile(tmpFile: string) {
    await rm(tmpFile, { force: true });
  }

  async process(documentId: string) {
    let tmpFile: string | undefined;
    try {
      // Load document
      const doc = await this.loadDocument(documentId);

      // Download document
      tmpFile = await this.downloadDocument(doc);

      // Extract content based on MIME type
      let extractedContent: ExtractedDocument;
      switch (doc.mimeType) {
        case MIME_TYPES.PDF:
          extractedContent = await this.extractPdfText(tmpFile);
          break;
        // TODO: Add support for other MIME types
        default:
          this.logger.error(`Unsupported MIME type: ${doc.mimeType}`);
          await this.prisma.document.update({
            where: { id: documentId },
            data: { status: DocumentStatus.FAILED },
          });
          throw new Error(`Unsupported MIME type: ${doc.mimeType}`);
      }

      // Create chunks
      const chunks = await this.createChunks(extractedContent);

      // Embed chunks
      const embeddedChunks = await this.embedService.embedChunks(chunks);

      // Store embeddings
      await this.vectorStoreService.store(embeddedChunks, documentId);

      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.READY },
      });
    } catch (error) {
      console.log(error);
      this.logger.error(`Error processing document ${documentId}: ${error}`);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.FAILED },
      });
      throw error;
    } finally {
      if (tmpFile) {
        await this.removeTemporaryFile(tmpFile);
      }
    }
  }
}
