import { API_BASE_URL, API_HEADERS } from "./constants";
import { getAccessToken, getWorkspaceId } from "@/lib/auth/tokens";

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
        message: { id: string; content: string; role: string };
        sources: ChatSource[];
        timings?: unknown;
        usage?: unknown;
        estimatedCost?: number | null;
      };
    }
  | { type: "error"; data: { message: string } };

export type StreamChatMessageInput = {
  agentId: string;
  message: string;
  conversationId?: string | null;
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
};

function parseSseChunk(buffer: string): {
  events: ChatStreamEvent[];
  rest: string;
} {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: ChatStreamEvent[] = [];

  for (const part of parts) {
    const dataLines = part
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());

    if (!dataLines.length) continue;

    try {
      const parsed = JSON.parse(dataLines.join("\n")) as ChatStreamEvent;
      events.push(parsed);
    } catch {
      // Ignore malformed chunks; wait for more bytes.
    }
  }

  return { events, rest };
}

/**
 * Streams a chat reply via SSE (`POST /agents/:agentId/chat`).
 * Uses fetch (not Axios) so we can read the response body as a stream.
 */
export async function streamChatMessage(input: StreamChatMessageInput) {
  const accessToken = getAccessToken();
  const workspaceId = getWorkspaceId();

  if (!accessToken) {
    throw new Error("You must be signed in to chat.");
  }
  if (!workspaceId) {
    throw new Error("No workspace selected.");
  }

  const response = await fetch(
    `${API_BASE_URL}/agents/${input.agentId}/chat`,
    {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        [API_HEADERS.WORKSPACE_ID]: workspaceId,
      },
      body: JSON.stringify({
        message: input.message,
        ...(input.conversationId
          ? { conversationId: input.conversationId }
          : {}),
      }),
      signal: input.signal,
    },
  );

  if (!response.ok) {
    let message = `Chat failed (${response.status})`;
    try {
      const payload = (await response.json()) as {
        message?: string;
        error?: { message?: string };
      };
      message = payload.error?.message || payload.message || message;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("Chat stream is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseChunk(buffer);
    buffer = parsed.rest;

    for (const event of parsed.events) {
      input.onEvent(event);
      if (event.type === "error") {
        throw new Error(event.data.message || "Chat stream error");
      }
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseChunk(`${buffer}\n\n`);
    for (const event of parsed.events) {
      input.onEvent(event);
      if (event.type === "error") {
        throw new Error(event.data.message || "Chat stream error");
      }
    }
  }
}
