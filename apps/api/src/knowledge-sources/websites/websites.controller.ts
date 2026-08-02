import {
  Controller,
  Post,
  Body,
} from "@nestjs/common";
import { WebsitesService } from "./websites.service";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { RequireWorkspace } from "../../common/decorators/workspace-protected.decorator";
import { CurrentWorkspace } from "../../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../../common/interfaces/request.interface";
import { WorkspaceRole } from "@repo/database";
import { WorkspaceRoles } from "../../common/decorators/workspace-roles.decorate";

@RequireWorkspace()
@Controller("knowledge/websites")
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Post()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  create(
    @Body() createWebsiteDto: CreateWebsiteDto,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.websitesService.create(workspace, createWebsiteDto);
  }
}
