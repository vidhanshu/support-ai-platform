import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AI_CONFIGS, ENV_KEYS } from "@repo/config";
import type { Chunk, EmbeddedChunk } from "@repo/contracts";
import { Ollama } from "ollama";

/** Keep models loaded indefinitely to avoid multi-second reload costs. */
const KEEP_ALIVE = -1;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: Ollama;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Ollama({
      host: this.configService.getOrThrow(ENV_KEYS.OLLAMA_BASE_URL),
    });
    this.model =
      this.configService.get(ENV_KEYS.OLLAMA_EMBED_MODEL) ??
      AI_CONFIGS.DEFAULT_EMBED_MODEL;
  }

  async embed(text: string) {
    const start = performance.now();
    const result = await this.client.embeddings({
      model: this.model,
      prompt: text,
      keep_alive: KEEP_ALIVE,
    });
    this.logger.log(
      `[perf] ollama.embed model=${this.model} total=${Math.round(performance.now() - start)}ms chars=${text.length}`,
    );
    return result.embedding;
  }

  async countTokens(text: string) {
    return Math.ceil(text.length / 4);
  }

  async embedChunks(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
    const result: EmbeddedChunk[] = [];
    for (const chunk of chunks) {
      const embedding = await this.embed(chunk.text);

      result.push({
        ...chunk,
        embedding,
        tokenCount: await this.countTokens(chunk.text),
      });
    }

    return result;
  }
}
