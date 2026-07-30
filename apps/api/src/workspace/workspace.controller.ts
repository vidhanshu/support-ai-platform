import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateWorkspaceDto } from "./dtos/create-workspace.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtUser } from "../auth/interfaces/jwt.interface";
import { UpdateWorkspaceDto } from "./dtos/update-workspace.dto";
import { WorkspaceRolesGuard } from "../common/guards/workspace-roles.guards";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { WorkspaceRole } from "@repo/database";
import { WorkspaceGuard } from "./guards/workspace.guard";

@Controller("workspaces")
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.create(user, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER)
  async update(
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.workspaceService.update(user, dto, id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: JwtUser) {
    return this.workspaceService.findAll(user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findById(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.workspaceService.findById(user, id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteById(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.workspaceService.deleteById(user, id);
  }
}
