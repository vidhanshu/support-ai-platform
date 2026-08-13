import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AI_CONFIGS, AVAILABLE_AGENT_MODELS } from "@repo/config";
import { EmbeddingService } from "./embedding/embedding.service";
import { LlmService } from "./llm/llm.service";

/**
 * Warms embedding (Ollama) + a single chat ping through the configured
 * LLM provider (Groq or Ollama) so the first user request is faster.
 */
@Injectable()
export class OllamaWarmupService implements OnModuleInit {
  private readonly logger = new Logger(OllamaWarmupService.name);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: LlmService,
  ) {}

  async onModuleInit() {
    // Worker + API both import AiModule; warming from both can OOM small EC2 hosts.
    if (process.env.OLLAMA_WARMUP === "false") {
      this.logger.log("[perf] ai warmup skipped (OLLAMA_WARMUP=false)");
      return;
    }

    const start = performance.now();
    this.logger.log("[perf] ai warmup start");

    try {
      await this.embeddingService.embed("warmup");

      // One chat ping with the default model (avoid burning Groq quota on every model).
      const model = AVAILABLE_AGENT_MODELS[0].value;
      const modelStart = performance.now();
      await this.llmService.generate({
        messages: [{ role: "user", content: "ping" }],
        model,
        temperature: 0,
        numCtx: AI_CONFIGS.NUM_CTX,
      });
      this.logger.log(
        `[perf] ai warmup chat model=${model} ms=${Math.round(performance.now() - modelStart)}`,
      );

      this.logger.log(
        `[perf] ai warmup done total=${Math.round(performance.now() - start)}ms`,
      );
    } catch (error) {
      this.logger.warn(
        `[perf] ai warmup failed after=${Math.round(performance.now() - start)}ms: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
