/**
 * Framework-agnostic Support AI client.
 * For React hooks / UI: `@support-ai/sdk/react`
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
} from "@support-ai/chat-core";
