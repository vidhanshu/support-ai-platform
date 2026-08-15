export { createClient, type SupportAIClient } from "./client";
export {
  SupportAIError,
  extractErrorCode,
  extractErrorMessage,
} from "./errors";
export { parseSseChunk } from "./sse";
export {
  loadConversationStore,
  saveConversationStore,
  conversationStoreKey,
  titleFromMessage,
  upsertConversation,
  getActiveConversation,
  type ConversationStore,
  type StoredConversation,
  type StoredChatMessage,
} from "./conversations";
export type {
  ChatSource,
  ChatStreamEvent,
  PublicAgent,
  StreamChatInput,
  SupportAIClientConfig,
} from "./types";
