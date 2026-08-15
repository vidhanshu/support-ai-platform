import {
  SupportAIError,
  extractErrorCode,
  extractErrorMessage,
} from "./errors";
import { parseSseChunk } from "./sse";
import type {
  PublicAgent,
  StreamChatInput,
  SupportAIClientConfig,
} from "./types";

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, "");
}

/** Nest `ResponseInterceptor` wraps JSON as `{ success: true, data }`. */
function unwrapData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success?: unknown }).success === true &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export type SupportAIClient = {
  readonly config: Readonly<SupportAIClientConfig>;
  getAgent: (signal?: AbortSignal) => Promise<PublicAgent>;
  chat: (input: StreamChatInput) => Promise<void>;
};

export function createClient(config: SupportAIClientConfig): SupportAIClient {
  const apiUrl = normalizeApiUrl(config.apiUrl);
  const doFetch = config.fetch ?? fetch;

  function authHeaders(
    accept: string,
    extra?: Record<string, string>,
  ): HeadersInit {
    return {
      Accept: accept,
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...config.headers,
      ...extra,
    };
  }

  async function throwHttpError(response: Response): Promise<never> {
    let message = `Request failed (${response.status})`;
    let code: string | undefined;
    let details: unknown;
    try {
      const payload = await response.json();
      details = payload;
      message = extractErrorMessage(payload, message);
      code = extractErrorCode(payload);
    } catch {
      // keep default
    }
    throw new SupportAIError(message, {
      status: response.status,
      code,
      details,
    });
  }

  async function getAgent(signal?: AbortSignal): Promise<PublicAgent> {
    const response = await doFetch(
      `${apiUrl}/public/agents/${config.agentId}`,
      {
        method: "GET",
        headers: authHeaders("application/json"),
        signal,
      },
    );

    if (!response.ok) {
      await throwHttpError(response);
    }

    const payload = (await response.json()) as unknown;
    return unwrapData<PublicAgent>(payload);
  }

  async function chat(input: StreamChatInput): Promise<void> {
    const body = JSON.stringify({
      message: input.message,
      ...(input.conversationId ? { conversationId: input.conversationId } : {}),
    });

    const response = await doFetch(
      `${apiUrl}/public/agents/${config.agentId}/chat`,
      {
        method: "POST",
        headers: authHeaders("text/event-stream"),
        body,
        signal: input.signal,
      },
    );

    if (!response.ok) {
      await throwHttpError(response);
    }

    if (!response.body) {
      throw new SupportAIError("Chat stream is empty.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const emit = (event: import("./types").ChatStreamEvent) => {
      input.onEvent?.(event);
      if (event.type === "error") {
        throw new SupportAIError(event.data.message || "Chat stream error");
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseChunk(buffer);
      buffer = parsed.rest;

      for (const event of parsed.events) {
        emit(event);
      }
    }

    if (buffer.trim()) {
      const parsed = parseSseChunk(`${buffer}\n\n`);
      for (const event of parsed.events) {
        emit(event);
      }
    }
  }

  return {
    config: { ...config, apiUrl },
    getAgent,
    chat,
  };
}
