import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { WorkspaceRole } from "@repo/database";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import { ApiKeysService } from "./api-keys.service";
import { CreateAgentApiKeyDto } from "./dto/create-agent-api-key.dto";

@RequireWorkspace()
@Controller("agents/:agentId/api-keys")
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  list(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("agentId") agentId: string,
  ) {
    return this.apiKeysService.list(workspace, agentId);
  }

  @Post()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  create(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("agentId") agentId: string,
    @Body() dto: CreateAgentApiKeyDto,
  ) {
    return this.apiKeysService.create(workspace, agentId, dto);
  }

  @Delete(":keyId")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  revoke(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("agentId") agentId: string,
    @Param("keyId") keyId: string,
  ) {
    return this.apiKeysService.revoke(workspace, agentId, keyId);
  }
}
