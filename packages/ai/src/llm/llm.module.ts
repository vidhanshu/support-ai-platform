import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AI_CONFIGS, ENV_KEYS } from "@repo/config";
import { LlmService } from "./llm.service";
import { LLM_PROVIDER } from "./llm.constants";
import { OllamaProvider } from "./providers/ollama.provider";

@Module({
  providers: [
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new OllamaProvider(
          config.getOrThrow(ENV_KEYS.OLLAMA_BASE_URL),
          config.get(ENV_KEYS.OLLAMA_CHAT_MODEL) ??
            AI_CONFIGS.DEFAULT_CHAT_MODEL,
        ),
    },
    LlmService,
  ],
  exports: [LlmService],
})
export class LlmModule {}
