"use client";

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  createClient,
  type SupportAIClient,
  type SupportAIClientConfig,
} from "@repo/chat-core";

const SupportAIContext = createContext<SupportAIClient | null>(null);

export type SupportAIProviderProps = SupportAIClientConfig & {
  children: ReactNode;
};

export function SupportAIProvider({
  children,
  ...config
}: SupportAIProviderProps) {
  const client = useMemo(
    () =>
      createClient({
        agentId: config.agentId,
        apiKey: config.apiKey,
        apiUrl: config.apiUrl,
        headers: config.headers,
        fetch: config.fetch,
      }),
    [
      config.agentId,
      config.apiKey,
      config.apiUrl,
      config.headers,
      config.fetch,
    ],
  );

  return createElement(SupportAIContext.Provider, { value: client }, children);
}

export function useSupportAIClient(): SupportAIClient {
  const client = useContext(SupportAIContext);
  if (!client) {
    throw new Error("useSupportAIClient must be used within SupportAIProvider");
  }
  return client;
}
