/**
 * Single source of truth for chat models selectable on agents.
 * Keep isomorphic (no Node APIs) so dashboard client code can import this.
 */
export const AVAILABLE_AGENT_MODELS = [
  { value: "llama3.1", label: "llama3.1" },
  { value: "qwen2.5:3b", label: "qwen2.5" },
] as const;

export type AgentModelId = (typeof AVAILABLE_AGENT_MODELS)[number]["value"];

/** Non-empty tuple of model ids — useful for zod / class-validator. */
export const AGENT_MODEL_IDS = AVAILABLE_AGENT_MODELS.map(
  (model) => model.value,
) as [AgentModelId, ...AgentModelId[]];

export const DEFAULT_AGENT_MODEL: AgentModelId =
  AVAILABLE_AGENT_MODELS[0].value;

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
