export type ChatSource = {
  id: string;
  text: string;
  knowledgeSourceId: string;
  pageNumber?: number;
  url?: string;
  title?: string;
  score: number;
};

export type ChatStreamEvent =
  | { type: "status"; data: { stage: string; ms?: number } }
  | {
      type: "retrieval";
      data: {
        chunks: number;
        knowledgeSources: number;
        candidates: number;
        embeddingMs: number;
        retrievalMs: number;
        rerankingMs: number;
      };
    }
  | {
      type: "meta";
      data: {
        conversationId: string;
        sources: ChatSource[];
      };
    }
  | { type: "token"; data: { content: string } }
  | {
      type: "done";
      data: {
        message: {
          id: string;
          content: string;
          role: string;
          responseMs?: number | null;
        };
        sources: ChatSource[];
        timings?: {
          totalRequestMs?: number;
          llmFirstTokenMs?: number | null;
          llmGenerationMs?: number;
          [key: string]: unknown;
        };
        usage?: unknown;
        estimatedCost?: number | null;
      };
    }
  | { type: "error"; data: { message: string } };

export type PublicAgent = {
  id: string;
  name: string;
  description: string | null;
};

export type SupportAIClientConfig = {
  /** Agent UUID from the dashboard. */
  agentId: string;
  /** Public agent API key (`sak_live_…` / `sak_test_…`). */
  apiKey: string;
  /**
   * API base including `/v1`, e.g. `https://api.example.com/v1`
   * or `http://localhost:3001/v1`.
   */
  apiUrl: string;
  /** Extra request headers (e.g. ngrok skip-browser-warning). */
  headers?: Record<string, string>;
  /** Defaults to `fetch`. */
  fetch?: typeof fetch;
};

export type StreamChatInput = {
  message: string;
  conversationId?: string | null;
  signal?: AbortSignal;
  onEvent?: (event: ChatStreamEvent) => void;
};
