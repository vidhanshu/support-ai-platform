export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type StoredConversation = {
  id: string;
  /** Display title (usually first user message, truncated). */
  title: string;
  updatedAt: number;
  messages: StoredChatMessage[];
};

export type ConversationStore = {
  version: 1;
  activeId: string | null;
  conversations: StoredConversation[];
};

const STORE_PREFIX = "support-ai:conversations:v1:";
const LEGACY_ACTIVE_PREFIX = "support-ai:conversation:";

export function conversationStoreKey(agentId: string): string {
  return `${STORE_PREFIX}${agentId}`;
}

function emptyStore(): ConversationStore {
  return { version: 1, activeId: null, conversations: [] };
}

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

export function loadConversationStore(agentId: string): ConversationStore {
  if (!canUseStorage()) return emptyStore();

  try {
    const raw = localStorage.getItem(conversationStoreKey(agentId));
    if (raw) {
      const parsed = JSON.parse(raw) as ConversationStore;
      if (parsed?.version === 1 && Array.isArray(parsed.conversations)) {
        return {
          version: 1,
          activeId: parsed.activeId ?? null,
          conversations: parsed.conversations,
        };
      }
    }

    // Migrate legacy single-id key.
    const legacyId = localStorage.getItem(`${LEGACY_ACTIVE_PREFIX}${agentId}`);
    if (legacyId) {
      const migrated: ConversationStore = {
        version: 1,
        activeId: legacyId,
        conversations: [
          {
            id: legacyId,
            title: "Previous chat",
            updatedAt: Date.now(),
            messages: [],
          },
        ],
      };
      saveConversationStore(agentId, migrated);
      localStorage.removeItem(`${LEGACY_ACTIVE_PREFIX}${agentId}`);
      return migrated;
    }
  } catch {
    // ignore
  }

  return emptyStore();
}

export function saveConversationStore(
  agentId: string,
  store: ConversationStore,
): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(conversationStoreKey(agentId), JSON.stringify(store));
  } catch {
    // ignore quota / private mode
  }
}

export function titleFromMessage(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  if (!trimmed) return "New chat";
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
}

export function upsertConversation(
  store: ConversationStore,
  conversation: StoredConversation,
): ConversationStore {
  const others = store.conversations.filter((c) => c.id !== conversation.id);
  return {
    ...store,
    activeId: conversation.id,
    conversations: [conversation, ...others].sort(
      (a, b) => b.updatedAt - a.updatedAt,
    ),
  };
}

export function getActiveConversation(
  store: ConversationStore,
): StoredConversation | null {
  if (!store.activeId) return null;
  return store.conversations.find((c) => c.id === store.activeId) ?? null;
}
