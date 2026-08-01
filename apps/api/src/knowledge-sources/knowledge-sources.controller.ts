import { Controller, Get, Param, Delete } from "@nestjs/common";
import { KnowledgeSourcesService } from "./knowledge-sources.service";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { WorkspaceRole } from "@repo/database";

@RequireWorkspace()
@Controller("knowledge")
export class KnowledgeSourcesController {
  constructor(private readonly knowledgeService: KnowledgeSourcesService) {}

  @Get()
  findAll(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.knowledgeService.findAll(workspace);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.knowledgeService.findOne(+id);
  }

  @Delete(":id")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  remove(
    @Param("id") id: string,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.knowledgeService.remove(workspace, id);
  }
}
