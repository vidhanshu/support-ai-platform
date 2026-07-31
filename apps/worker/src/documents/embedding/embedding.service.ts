import { Injectable } from "@nestjs/common";
import ollama from "ollama";
import { Chunk } from "../../interfaces";

@Injectable()
export class EmbeddingService {
  async embed(text: string) {
    const result = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: text,
    });
    return result.embedding;
  }


  async embedChunks(chunks: Chunk[]) {
    const result = [];
    for (const chunk of chunks) {
      const embedding = await this.embed(chunk.text);

      result.push({
        ...chunk,
        embedding,
      });
    }

    return result;
  }
}
