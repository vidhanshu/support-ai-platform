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

@Controller("workspaces")
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createWorkspace(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.createWorkspace(user, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateWorkspace(
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.workspaceService.updateWorkspace(user, dto, id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async workspaces(@CurrentUser() user: JwtUser) {
    return this.workspaceService.workspaces(user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async workspaceById(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.workspaceService.workspaceById(user, id);
  }
  
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteWorkspace(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.workspaceService.deleteWorkspace(user, id);
  }
}
