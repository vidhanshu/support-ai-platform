import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Injectable } from "@nestjs/common";
import type {
  Chunk,
  ExtractedDocument,
  ExtractedWebsite,
} from "@repo/contracts";

@Injectable()
export class ChunkingService {
  async createChunks(extractedDocument: ExtractedDocument): Promise<Chunk[]> {
    const splitter = this.createSplitter();
    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    for (const page of extractedDocument.pages) {
      if (!page.text.trim()) continue;

      const pageChunks = await splitter.splitText(page.text);
      for (const text of pageChunks) {
        chunks.push({
          text,
          index: chunkIndex,
          metadata: {
            pageNumber: page.pageNumber,
            ...(page.url ? { url: page.url } : {}),
            ...(page.title ? { title: page.title } : {}),
          },
        });
        chunkIndex += 1;
      }
    }

    return chunks;
  }

  async createWebsiteChunks(extractedWebsite: ExtractedWebsite): Promise<Chunk[]> {
    const splitter = this.createSplitter();
    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    for (const page of extractedWebsite.pages) {
      if (!page.text.trim()) continue;

      const pageChunks = await splitter.splitText(page.text);
      for (const text of pageChunks) {
        chunks.push({
          text,
          index: chunkIndex,
          metadata: {
            url: page.url,
            ...(page.title ? { title: page.title } : {}),
          },
        });
        chunkIndex += 1;
      }
    }

    return chunks;
  }

  private createSplitter() {
    return new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }
}
