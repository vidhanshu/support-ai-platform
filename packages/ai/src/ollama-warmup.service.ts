import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AI_CONFIGS, AVAILABLE_AGENT_MODELS } from "@repo/config";
import { EmbeddingService } from "./embedding/embedding.service";
import { LlmService } from "./llm/llm.service";

/**
 * Preloads embed + chat models into Ollama on API boot so the first
 * user request does not pay a cold model-load (~30-60s on CPU).
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
      this.logger.log("[perf] ollama warmup skipped (OLLAMA_WARMUP=false)");
      return;
    }

    const start = performance.now();
    this.logger.log("[perf] ollama warmup start");

    try {
      await this.embeddingService.embed("warmup");

      for (const model of AVAILABLE_AGENT_MODELS) {
        const modelStart = performance.now();
        await this.llmService.generate({
          messages: [{ role: "user", content: "ping" }],
          model: model.value,
          temperature: 0,
          numCtx: AI_CONFIGS.NUM_CTX,
        });
        this.logger.log(
          `[perf] ollama warmup model=${model.value} ms=${Math.round(performance.now() - modelStart)}`,
        );
      }

      this.logger.log(
        `[perf] ollama warmup done total=${Math.round(performance.now() - start)}ms`,
      );
    } catch (error) {
      this.logger.warn(
        `[perf] ollama warmup failed after=${Math.round(performance.now() - start)}ms: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
