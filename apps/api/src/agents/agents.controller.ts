import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { AgentsService } from "./agents.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import type { JwtUser } from "../auth/interfaces/jwt.interface";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { WorkspaceRole } from "@repo/database";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";

@RequireWorkspace()
@Controller("agents")
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  create(
    @Body() createAgentDto: CreateAgentDto,
    @CurrentUser() user: JwtUser,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.agentsService.create(workspace, createAgentDto, user);
  }

  @Get()
  findAll(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.agentsService.findAll(workspace);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.agentsService.findOne(workspace, id);
  }
  @Patch(":id")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  update(
    @Param("id") id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.agentsService.update(workspace, id, updateAgentDto);
  }

  @Delete(":id")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  remove(
    @Param("id") id: string,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.agentsService.remove(workspace, id);
  }

  @Post(":id/attach-knowledge-source/:knowledgeSourceId")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  attachKnowledgeSource(
    @Param("id") id: string,
    @Param("knowledgeSourceId") knowledgeSourceId: string,
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: JwtUser,
  ) {
    return this.agentsService.attachKnowledgeSource(
      workspace,
      user,
      id,
      knowledgeSourceId,
    );
  }

  @Delete(":id/detach-knowledge-source/:knowledgeSourceId")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  detachKnowledgeSource(
    @Param("id") id: string,
    @Param("knowledgeSourceId") knowledgeSourceId: string,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.agentsService.detachKnowledgeSource(
      workspace,
      id,
      knowledgeSourceId,
    );
  }
}
