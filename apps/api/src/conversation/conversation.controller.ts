import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { BulkDeleteConversationsDto } from "./dto/bulk-delete-conversations.dto";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import { WorkspaceRole } from "@repo/database";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";

@Controller("conversation")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @RequireWorkspace()
  list(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Query("agentId", ParseUUIDPipe) agentId: string,
  ) {
    return this.conversationService.listByAgent(workspace, agentId);
  }

  /** Static path must stay above `:id` so it is not captured as an id. */
  @Post("bulk-delete")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  removeMany(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Body() dto: BulkDeleteConversationsDto,
  ) {
    return this.conversationService.removeMany(workspace, dto);
  }

  @Get(":id")
  @RequireWorkspace()
  findOne(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.conversationService.findOne(workspace, id);
  }
}
