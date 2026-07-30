import { applyDecorators, UseGuards } from "@nestjs/common";
import { WorkspaceRolesGuard } from "../guards/workspace-roles.guards";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../../workspace/guards/workspace.guard";

export function RequireWorkspace() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceRolesGuard),
  );
}
