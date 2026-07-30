import { SetMetadata } from "@nestjs/common";
import { WorkspaceRole } from "@repo/database";
import { WORKSPACE_ROLES_KEY } from "../configs";

export const WorkspaceRoles = (...roles: WorkspaceRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);