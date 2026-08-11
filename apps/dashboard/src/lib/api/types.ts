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

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  role?: WorkspaceRole | null;
  _count?: {
    members: number;
  };
};

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export type WorkspaceInvitation = {
  id: string;
  email: string;
  role: WorkspaceRole;
  workspaceId: string;
  invitedById: string;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AcceptInvitationResponse = {
  workspaceId: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
};

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
  responseMs?: number | null;
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

export type SubscriptionPlan = "FREE" | "HOBBY" | "PRO";

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "UNPAID";

export type PlanLimits = {
  agents: number;
  knowledgeSources: number;
  chatMessagesPerMonth: number;
  websiteSources: boolean;
  teamMembers: number;
};

export type BillingStatus = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus | string;
  limits: PlanLimits;
  usage: {
    chatMessagesThisMonth: number;
  };
  subscription: {
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
};

export type CheckoutSessionResponse = {
  url: string;
};

export type ChangePlanResponse =
  | CheckoutSessionResponse
  | {
      action: "cancel_at_period_end";
      cancelAtPeriodEnd: boolean;
      currentPeriodEnd: string | null;
    }
  | {
      action: "subscription_updated";
      plan: SubscriptionPlan;
    };
