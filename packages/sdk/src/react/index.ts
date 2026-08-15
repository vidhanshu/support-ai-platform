export { SupportAIProvider, useSupportAIClient } from "./provider";
export type { SupportAIProviderProps } from "./provider";
export { useChat } from "./use-chat";
export type { ChatMessage, UseChatOptions } from "./use-chat";
export { ChatPanel } from "./chat-panel";
export type { ChatPanelProps } from "./chat-panel";
export { ChatBubble } from "./chat-bubble";
export type { ChatBubbleProps, ChatBubblePosition } from "./chat-bubble";

export {
  createClient,
  SupportAIError,
  type SupportAIClient,
  type SupportAIClientConfig,
  type PublicAgent,
  type ChatSource,
  type ChatStreamEvent,
} from "@support-ai/chat-core";
