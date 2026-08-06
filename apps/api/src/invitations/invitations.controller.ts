import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import { WorkspaceRole } from "@repo/database";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import type { JwtUser } from "../auth/interfaces/jwt.interface";
import { Authenticated } from "../common/decorators/authenticated.decorator";

@Controller("invitations")
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  create(
    @Body() dto: CreateInvitationDto,
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: JwtUser,
  ) {
    return this.invitationsService.create(workspace, user, dto);
  }

  @Get()
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  findAll(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.invitationsService.findAll(workspace);
  }

  @Post("accept")
  @Authenticated()
  accept(@Query("token") token: string, @CurrentUser() user: JwtUser) {
    if (!token) throw new BadRequestException("Invalid token");
    return this.invitationsService.accept(user, token);
  }

  @Post(":id/resend")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  resend(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.invitationsService.resend(workspace, user, id);
  }

  @Delete(":id")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  remove(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("id") id: string,
  ) {
    return this.invitationsService.remove(workspace, id);
  }
}
