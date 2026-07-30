import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

@Controller("workspaces")
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @RequireWorkspace()
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
