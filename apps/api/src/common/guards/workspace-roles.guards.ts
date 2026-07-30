import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticatedRequest } from "../interfaces/request.interface";
import { WorkspaceRole } from "@repo/database";
import { WORKSPACE_ROLES_KEY } from "../configs";

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No decorator = public for authenticated workspace members
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const currentRole = request.workspace.role;

    if (!requiredRoles.includes(currentRole)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
