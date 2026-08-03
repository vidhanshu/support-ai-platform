import { apiClient } from "./client";
import type { HealthResponse } from "./types";

export const healthApi = {
  get: () =>
    apiClient.get<HealthResponse>("/health", {
      auth: false,
    }),
};
