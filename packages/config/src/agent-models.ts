/**
 * Single source of truth for chat models selectable on agents.
 * Keep isomorphic (no Node APIs) so dashboard client code can import this.
 *
 * Groq models are routed to Groq; Ollama models (e.g. qwen2.5:3b) stay local.
 */
export const AVAILABLE_AGENT_MODELS = [
  { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B (Groq)" },
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B (Groq)" },
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Groq)" },
  { value: "qwen2.5:3b", label: "qwen2.5:3b (Ollama)" },
] as const;

export type AgentModelId = (typeof AVAILABLE_AGENT_MODELS)[number]["value"];

/** Non-empty tuple of model ids — useful for zod / class-validator. */
export const AGENT_MODEL_IDS = AVAILABLE_AGENT_MODELS.map(
  (model) => model.value,
) as [AgentModelId, ...AgentModelId[]];

export const DEFAULT_AGENT_MODEL: AgentModelId =
  AVAILABLE_AGENT_MODELS[0].value;

/** Models served by local Ollama (everything else uses Groq when configured). */
export const OLLAMA_AGENT_MODEL_IDS = ["qwen2.5:3b"] as const;

export function isOllamaAgentModel(model: string | null | undefined): boolean {
  return (
    !!model &&
    (OLLAMA_AGENT_MODEL_IDS as readonly string[]).includes(model)
  );
}

/** Default sampling temperature for new agents / forms */
export const DEFAULT_AGENT_TEMPERATURE = 0.2;

/** Coerce a stored/API model string to a known agent model id. */
export function resolveAgentModel(
  model: string | null | undefined,
): AgentModelId {
  if (model && (AGENT_MODEL_IDS as readonly string[]).includes(model)) {
    return model as AgentModelId;
  }
  return DEFAULT_AGENT_MODEL;
}
