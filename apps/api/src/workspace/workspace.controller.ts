import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { CreateWorkspaceDto } from "./dtos/create-workspace.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtUser } from "../auth/interfaces/jwt.interface";
import { UpdateWorkspaceDto } from "./dtos/update-workspace.dto";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { WorkspaceRole } from "@repo/database";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import { Authenticated } from "../common/decorators/authenticated.decorator";
import { CurrentWorkspace } from "./decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";

@Controller("workspaces")
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @Authenticated()
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.create(user, dto);
  }

  @Patch(":id")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.OWNER)
  async update(
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.workspaceService.update(user, dto, id);
  }

  @Get()
  @Authenticated()
  async findAll(@CurrentUser() user: JwtUser) {
    return this.workspaceService.findAll(user);
  }

  @Get(":id")
  @Authenticated()
  async findById(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.workspaceService.findById(user, id);
  }

  @Delete(":id")
  @Authenticated()
  async deleteById(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.workspaceService.deleteById(user, id);
  }
}

@Controller("members")
export class MembersController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @RequireWorkspace()
  list(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.workspaceService.listMembers(workspace);
  }

  @Delete(":id")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  remove(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: JwtUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.workspaceService.removeMember(workspace, user, id);
  }
}
