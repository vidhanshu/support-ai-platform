import { Injectable } from "@nestjs/common";
import type { TokenUsage } from "../llm/llm.types";

export type CostEstimateInput = {
  provider: string;
  model: string;
  usage: TokenUsage;
};

/**
 * Provider-agnostic cost estimation.
 * Local/Ollama models are free; cloud providers can plug in real pricing later.
 */
export interface CostCalculator {
  estimate(input: CostEstimateInput): number | null;
}

@Injectable()
export class DefaultCostCalculator implements CostCalculator {
  estimate(input: CostEstimateInput): number | null {
    if (input.provider === "ollama") {
      return 0;
    }

    // Unknown cloud provider without a pricing table yet
    return null;
  }
}
