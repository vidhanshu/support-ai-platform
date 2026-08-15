"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SupportAIError,
  type ChatSource,
  type PublicAgent,
} from "@repo/chat-core";
import { useSupportAIClient } from "./provider";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  pending?: boolean;
};

function createId() {
  return crypto.randomUUID();
}

function conversationStorageKey(agentId: string) {
  return `support-ai:conversation:${agentId}`;
}

export type UseChatOptions = {
  /** Persist conversation id in localStorage (default true). */
  persistConversation?: boolean;
  /** Seed / override conversation id. */
  conversationId?: string | null;
};

export function useChat(options: UseChatOptions = {}) {
  const client = useSupportAIClient();
  const persist = options.persistConversation !== false;

  const [agent, setAgent] = useState<PublicAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    options.conversationId ?? null,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (options.conversationId !== undefined) {
      setConversationId(options.conversationId);
      return;
    }
    if (!persist) return;
    try {
      setConversationId(
        localStorage.getItem(conversationStorageKey(client.config.agentId)),
      );
    } catch {
      // ignore
    }
  }, [client.config.agentId, options.conversationId, persist]);

  useEffect(() => {
    let cancelled = false;
    void client.getAgent().then(
      (value) => {
        if (!cancelled) setAgent(value);
      },
      () => {
        // soft-fail
      },
    );
    return () => {
      cancelled = true;
    };
  }, [client]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setConversationId(null);
    setStatus(null);
    setError(null);
    setIsStreaming(false);
    if (persist) {
      try {
        localStorage.removeItem(conversationStorageKey(client.config.agentId));
      } catch {
        // ignore
      }
    }
  }, [client.config.agentId, persist]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setStatus("starting");

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = createId();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "", pending: true },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await client.chat({
          message: trimmed,
          conversationId,
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === "status") {
              setStatus(event.data.stage);
              return;
            }
            if (event.type === "meta") {
              setConversationId(event.data.conversationId);
              if (persist) {
                try {
                  localStorage.setItem(
                    conversationStorageKey(client.config.agentId),
                    event.data.conversationId,
                  );
                } catch {
                  // ignore
                }
              }
              return;
            }
            if (event.type === "token") {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        content: `${message.content}${event.data.content}`,
                        pending: true,
                      }
                    : message,
                ),
              );
              return;
            }
            if (event.type === "done") {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        content:
                          event.data.message.content || message.content,
                        sources: event.data.sources,
                        pending: false,
                      }
                    : message,
                ),
              );
            }
          },
        });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        const message =
          err instanceof SupportAIError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Chat failed";
        setError(message);
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: message.content || "(failed to get a reply)",
                  pending: false,
                }
              : message,
          ),
        );
      } finally {
        setIsStreaming(false);
        setStatus(null);
        abortRef.current = null;
      }
    },
    [client, conversationId, isStreaming, persist],
  );

  return {
    agent,
    messages,
    conversationId,
    status,
    isStreaming,
    error,
    sendMessage,
    reset,
  };
}
