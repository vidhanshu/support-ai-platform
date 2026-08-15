"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SupportAIError,
  getActiveConversation,
  loadConversationStore,
  saveConversationStore,
  titleFromMessage,
  upsertConversation,
  type ChatSource,
  type PublicAgent,
  type StoredChatMessage,
  type StoredConversation,
} from "@support-ai/chat-core";
import { useSupportAIClient } from "./provider";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  pending?: boolean;
};

export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: number;
  messageCount: number;
};

function createId() {
  return crypto.randomUUID();
}

function toSummaries(list: StoredConversation[]): ConversationSummary[] {
  return list.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
    messageCount: c.messages.length,
  }));
}

function toUiMessages(messages: StoredChatMessage[]): ChatMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));
}

function toStored(messages: ChatMessage[]): StoredChatMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .filter((m) => !m.pending || m.content.length > 0)
    .map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }));
}

export type UseChatOptions = {
  /** Persist conversations in localStorage (default true). */
  persistConversation?: boolean;
};

export function useChat(options: UseChatOptions = {}) {
  const client = useSupportAIClient();
  const persist = options.persistConversation !== false;
  const agentId = client.config.agentId;

  const [agent, setAgent] = useState<PublicAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const titleRef = useRef<string>("New chat");

  const refreshSummaries = useCallback(() => {
    if (!persist) return;
    const store = loadConversationStore(agentId);
    setConversations(toSummaries(store.conversations));
  }, [agentId, persist]);

  const persistActive = useCallback(
    (id: string | null, nextMessages: ChatMessage[], title?: string) => {
      if (!persist || !id) return;
      const store = loadConversationStore(agentId);
      const existing = store.conversations.find((c) => c.id === id);
      const nextTitle =
        title ??
        existing?.title ??
        titleRef.current ??
        "New chat";
      const updated = upsertConversation(store, {
        id,
        title: nextTitle,
        updatedAt: Date.now(),
        messages: toStored(nextMessages),
      });
      saveConversationStore(agentId, updated);
      setConversations(toSummaries(updated.conversations));
    },
    [agentId, persist],
  );

  useEffect(() => {
    if (!persist) return;
    const store = loadConversationStore(agentId);
    setConversations(toSummaries(store.conversations));
    const active = getActiveConversation(store);
    if (active) {
      setConversationId(active.id);
      setMessages(toUiMessages(active.messages));
      titleRef.current = active.title;
    }
  }, [agentId, persist]);

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

  const selectConversation = useCallback(
    (id: string) => {
      abortRef.current?.abort();
      abortRef.current = null;
      setIsStreaming(false);
      setStatus(null);
      setError(null);

      if (!persist) {
        setConversationId(id);
        return;
      }

      const store = loadConversationStore(agentId);
      const found = store.conversations.find((c) => c.id === id);
      if (!found) return;

      const next = { ...store, activeId: id };
      saveConversationStore(agentId, next);
      setConversationId(found.id);
      setMessages(toUiMessages(found.messages));
      titleRef.current = found.title;
      setConversations(toSummaries(next.conversations));
    },
    [agentId, persist],
  );

  const newConversation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setConversationId(null);
    setStatus(null);
    setError(null);
    setIsStreaming(false);
    titleRef.current = "New chat";

    if (persist) {
      const store = loadConversationStore(agentId);
      saveConversationStore(agentId, { ...store, activeId: null });
      refreshSummaries();
    }
  }, [agentId, persist, refreshSummaries]);

  const deleteConversation = useCallback(
    (id: string) => {
      if (!persist) return;
      const store = loadConversationStore(agentId);
      const conversationsNext = store.conversations.filter((c) => c.id !== id);
      const activeId =
        store.activeId === id ? null : store.activeId;
      saveConversationStore(agentId, {
        version: 1,
        activeId,
        conversations: conversationsNext,
      });
      setConversations(toSummaries(conversationsNext));
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
        titleRef.current = "New chat";
      }
    },
    [agentId, conversationId, persist],
  );

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

      const startingMessages: ChatMessage[] = [
        ...messages,
        userMessage,
        { id: assistantId, role: "assistant", content: "", pending: true },
      ];
      setMessages(startingMessages);

      if (!conversationId) {
        titleRef.current = titleFromMessage(trimmed);
      }

      const controller = new AbortController();
      abortRef.current = controller;

      let activeId = conversationId;

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
              activeId = event.data.conversationId;
              setConversationId(activeId);
              return;
            }
            if (event.type === "token") {
              setMessages((prev) => {
                const next = prev.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        content: `${message.content}${event.data.content}`,
                        pending: true,
                      }
                    : message,
                );
                return next;
              });
              return;
            }
            if (event.type === "done") {
              setMessages((prev) => {
                const next = prev.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        content:
                          event.data.message.content || message.content,
                        sources: event.data.sources,
                        pending: false,
                      }
                    : message,
                );
                if (activeId) {
                  persistActive(activeId, next, titleRef.current);
                }
                return next;
              });
            }
          },
        });

        // Persist even if stream ended without a done event.
        setMessages((prev) => {
          if (activeId) persistActive(activeId, prev, titleRef.current);
          return prev;
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
        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content || "(failed to get a reply)",
                  pending: false,
                }
              : m,
          );
          if (activeId) persistActive(activeId, next, titleRef.current);
          return next;
        });
      } finally {
        setIsStreaming(false);
        setStatus(null);
        abortRef.current = null;
      }
    },
    [client, conversationId, isStreaming, messages, persistActive],
  );

  return {
    agent,
    messages,
    conversationId,
    conversations,
    status,
    isStreaming,
    error,
    sendMessage,
    /** Start a fresh thread (does not delete old ones). */
    newConversation,
    /** @deprecated use newConversation */
    reset: newConversation,
    selectConversation,
    deleteConversation,
  };
}
