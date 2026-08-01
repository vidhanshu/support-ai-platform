import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Injectable } from "@nestjs/common";
import { Chunk, ExtractedDocument } from "@repo/contracts";

@Injectable()
export class ChunkingService {
  async createChunks(extractedDocument: ExtractedDocument): Promise<Chunk[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    for (const page of extractedDocument.pages) {
      if (!page.text.trim()) {
        continue;
      }

      const pageChunks = await splitter.splitText(page.text);

      for (const text of pageChunks) {
        chunks.push({
          text,
          index: chunkIndex,
          metadata: {
            pageNumber: page.pageNumber,
          },
        });
        chunkIndex += 1;
      }
    }

    return chunks;
  }
}
