import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { WorkspaceRole } from "@repo/database";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("upload-url")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  uploadUrl(
    @Body() dto: CreateUploadUrlDto,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.documentsService.uploadUrl(workspace, dto);
  }

  @Post(":id/complete")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  complete(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("id") documentId: string,
  ) {
    return this.documentsService.complete(workspace, documentId);
  }

  @Get()
  @RequireWorkspace()
  findAll(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.documentsService.findAll(workspace);
  }

  @Delete(":id")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  remove(
    @Param("id") id: string,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.documentsService.remove(workspace, id);
  }
}
