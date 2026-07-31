import { Controller, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { RequireWorkspace } from '../common/decorators/workspace-protected.decorator';
import { CurrentWorkspace } from '../workspace/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../common/interfaces/request.interface';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get(":id")
  @RequireWorkspace()
  findAll(@CurrentWorkspace() workspace: WorkspaceContext, @Param("id") id: string) {
    return this.conversationService.findAll(workspace, id);
  }
}
