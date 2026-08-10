import { API_BASE_URL, API_HEADERS } from "./constants";
import { refreshSession } from "./client";
import { ApiError, extractApiErrorCode, extractApiErrorMessage } from "./errors";
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

function buildChatHeaders(): HeadersInit {
  const accessToken = getAccessToken();
  const workspaceId = getWorkspaceId();

  if (!accessToken) {
    throw new Error("You must be signed in to chat.");
  }
  if (!workspaceId) {
    throw new Error("No workspace selected.");
  }

  return {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    [API_HEADERS.WORKSPACE_ID]: workspaceId,
  };
}

async function throwChatHttpError(response: Response): Promise<never> {
  let message = `Chat failed (${response.status})`;
  let code: string | undefined;
  let details: unknown;
  try {
    const payload = await response.json();
    details = payload;
    message = extractApiErrorMessage(payload, message);
    code = extractApiErrorCode(payload);
  } catch {
    // keep default
  }
  throw new ApiError(message, response.status, details, code);
}

/**
 * Streams a chat reply via SSE (`POST /agents/:agentId/chat`).
 * Uses fetch (not Axios) so we can read the response body as a stream.
 * On 401, refreshes the session once and retries (Axios does the same).
 */
export async function streamChatMessage(input: StreamChatMessageInput) {
  const body = JSON.stringify({
    message: input.message,
    ...(input.conversationId ? { conversationId: input.conversationId } : {}),
  });

  const url = `${API_BASE_URL}/agents/${input.agentId}/chat`;

  let response = await fetch(url, {
    method: "POST",
    headers: buildChatHeaders(),
    body,
    signal: input.signal,
  });

  if (response.status === 401) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      await throwChatHttpError(response);
    }

    response = await fetch(url, {
      method: "POST",
      headers: buildChatHeaders(),
      body,
      signal: input.signal,
    });
  }

  if (!response.ok) {
    await throwChatHttpError(response);
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
