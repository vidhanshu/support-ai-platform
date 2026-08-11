import { Body, Controller, Post } from "@nestjs/common";
import { TextSnippetsService } from "./text-snippets.service";
import { CreateTextSnippetDto } from "./dto/create-text-snippet.dto";
import { RequireWorkspace } from "../../common/decorators/workspace-protected.decorator";
import { CurrentWorkspace } from "../../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../../common/interfaces/request.interface";
import { WorkspaceRole } from "@repo/database";
import { WorkspaceRoles } from "../../common/decorators/workspace-roles.decorate";

@RequireWorkspace()
@Controller("knowledge/text-snippets")
export class TextSnippetsController {
  constructor(private readonly textSnippetsService: TextSnippetsService) {}

  @Post()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  create(
    @Body() dto: CreateTextSnippetDto,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.textSnippetsService.create(workspace, dto);
  }
}
