export type User = {
  id: string;
  email: string;
  name: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
  };
};

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export type HealthResponse = {
  status: string;
  database: string;
};

export type Agent = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  generalPrompt: string | null;
  guardrailsPrompt: string | null;
  model: string | null;
  temperature: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSourceType =
  | "DOCUMENT"
  | "QNA"
  | "WEBSITE"
  | "NOTION"
  | "TICKET";

export type KnowledgeSourceStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type KnowledgeDocument = {
  id: string;
  originalFilename: string;
  objectKey: string;
  mimeType: string;
  size: number;
  uploadStatus: string;
  knowledgeSourceId: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeWebsite = {
  id: string;
  rootUrl: string;
  allowedHosts: string[];
  maxPages: number;
  crawlDepth: number;
  pagesFound: number;
  pagesCrawled: number;
  lastCrawledAt: string | null;
  errorMessage: string | null;
  knowledgeSourceId: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSourceAgentLink = {
  id: string;
  agentId: string;
  knowledgeSourceId: string;
  createdAt: string;
  agent: {
    id: string;
    name: string;
  };
};

export type KnowledgeSource = {
  id: string;
  workspaceId: string;
  name: string;
  type: KnowledgeSourceType | string;
  status: KnowledgeSourceStatus | string;
  createdAt: string;
  updatedAt: string;
  document?: KnowledgeDocument | null;
  website?: KnowledgeWebsite | null;
  agents?: KnowledgeSourceAgentLink[];
};

export type AgentKnowledgeSource = {
  id: string;
  agentId: string;
  knowledgeSourceId: string;
  createdAt: string;
  knowledgeSource: KnowledgeSource;
};

export type AgentDetail = Agent & {
  knowledgeSources?: AgentKnowledgeSource[];
};

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export type ConversationMessage = {
  id: string;
  conversationId: string;
  role: MessageRole | string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationLastMessage = {
  id: string;
  role: MessageRole | string;
  content: string;
  createdAt: string;
};

export type ConversationListItem = {
  id: string;
  workspaceId: string;
  agentId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: ConversationLastMessage | null;
  messageCount: number;
};

export type ConversationDetail = {
  id: string;
  workspaceId: string;
  agentId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
};
