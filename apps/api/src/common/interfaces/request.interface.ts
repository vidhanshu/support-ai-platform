import type { WorkspaceRole } from "@repo/database";
import type { JwtUser } from "../../auth/interfaces/jwt.interface";
import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
  workspace: {
    id: string;
    name: string;
    slug: string;
    role: WorkspaceRole;
  };
}
