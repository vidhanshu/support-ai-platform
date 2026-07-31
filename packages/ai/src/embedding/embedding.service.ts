import { Injectable } from "@nestjs/common";
import ollama from "ollama";
import type { Chunk } from "@repo/contracts";

@Injectable()
export class EmbeddingService {
  async embed(text: string) {
    const result = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: text,
    });
    return result.embedding;
  }

  async countTokens(text: string) {
    return Math.ceil(text.length / 4);
  }

  async embedChunks(chunks: Chunk[]) {
    const result = [];
    for (const chunk of chunks) {
      const embedding = await this.embed(chunk.text);

      result.push({
        ...chunk,
        embedding,
        tokenCount: await this.countTokens(chunk.text),
        metadata: chunk.metadata,
      });
    }

    return result;
  }
}
