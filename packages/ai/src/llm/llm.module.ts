import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AI_CONFIGS, ENV_KEYS } from "@repo/config";
import { LlmService } from "./llm.service";
import { LLM_PROVIDER } from "./llm.constants";
import { GroqProvider } from "./providers/groq.provider";
import { OllamaProvider } from "./providers/ollama.provider";
import { RoutingLlmProvider } from "./providers/routing.provider";

@Module({
  providers: [
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider =
          config.get<string>(ENV_KEYS.LLM_PROVIDER)?.toLowerCase() ?? "ollama";
        const ollama = new OllamaProvider(
          config.getOrThrow(ENV_KEYS.OLLAMA_BASE_URL),
          config.get(ENV_KEYS.OLLAMA_CHAT_MODEL) ?? "qwen2.5:3b",
        );

        // `groq` = Groq for cloud models + Ollama for local models (e.g. qwen2.5:3b)
        if (provider === "groq") {
          const groq = new GroqProvider(
            config.getOrThrow(ENV_KEYS.GROQ_API_KEY),
            config.get(ENV_KEYS.GROQ_CHAT_MODEL) ??
              AI_CONFIGS.DEFAULT_CHAT_MODEL,
          );
          return new RoutingLlmProvider(
            groq,
            ollama,
            config.get(ENV_KEYS.GROQ_CHAT_MODEL) ??
              AI_CONFIGS.DEFAULT_CHAT_MODEL,
          );
        }

        return ollama;
      },
    },
    LlmService,
  ],
  exports: [LlmService],
})
export class LlmModule {}
