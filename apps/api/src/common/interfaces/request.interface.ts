import type { WorkspaceRole } from "@repo/database";
import type { JwtUser } from "../../auth/interfaces/jwt.interface";
import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
  workspace: WorkspaceContext;
}

export interface WorkspaceContext {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
}

export type PublicApiKeyContext = {
  id: string;
  agentId: string;
  workspaceId: string;
  allowedOrigins: string[];
  rateLimitRpm: number;
};

export type PublicAgentContext = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export interface PublicApiRequest extends Request {
  apiKey: PublicApiKeyContext;
  publicAgent: PublicAgentContext;
}
