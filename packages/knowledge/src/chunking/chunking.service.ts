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

    const chunks = await splitter.splitText(extractedDocument.text);

    return chunks.map((chunk, index) => ({
      text: chunk,
      index,
      metadata: extractedDocument.metadata,
    }));
  }
}
