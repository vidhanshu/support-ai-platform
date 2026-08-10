"use client";

import { useCallback, useRef, useState } from "react";
import {
  streamChatMessage,
  type ChatSource,
} from "@/lib/api/chat";
import { toastApiError } from "@/lib/toast";

export type PlaygroundMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  pending?: boolean;
};

function createId() {
  return crypto.randomUUID();
}

export function usePlaygroundChat(agentId: string) {
  const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setConversationId(null);
    setStatus(null);
    setError(null);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setStatus("starting");

      const userMessage: PlaygroundMessage = {
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
        await streamChatMessage({
          agentId,
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
                        content: event.data.message.content || message.content,
                        sources: event.data.sources,
                        pending: false,
                      }
                    : message,
                ),
              );
              setStatus(null);
            }
          },
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Unable to send message.";
        setError(message);
        toastApiError(err, "Unable to send message.");
        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId
              ? {
                  ...item,
                  content: item.content || "Something went wrong.",
                  pending: false,
                }
              : item,
          ),
        );
      } finally {
        setIsStreaming(false);
        setStatus(null);
        abortRef.current = null;
      }
    },
    [agentId, conversationId, isStreaming],
  );

  return {
    messages,
    conversationId,
    status,
    error,
    isStreaming,
    sendMessage,
    reset,
  };
}
