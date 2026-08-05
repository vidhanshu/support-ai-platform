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
  systemPrompt: string | null;
  model: string | null;
  temperature: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSource = {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
