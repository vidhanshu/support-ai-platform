/**
 * Framework-agnostic Support AI client.
 * For React hooks / UI: `@repo/sdk/react`
 */
export {
  createClient,
  SupportAIError,
  parseSseChunk,
  type SupportAIClient,
  type SupportAIClientConfig,
  type PublicAgent,
  type ChatSource,
  type ChatStreamEvent,
  type StreamChatInput,
} from "@repo/chat-core";
