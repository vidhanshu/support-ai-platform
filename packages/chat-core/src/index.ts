export { createClient, type SupportAIClient } from "./client";
export {
  SupportAIError,
  extractErrorCode,
  extractErrorMessage,
} from "./errors";
export { parseSseChunk } from "./sse";
export type {
  ChatSource,
  ChatStreamEvent,
  PublicAgent,
  StreamChatInput,
  SupportAIClientConfig,
} from "./types";
