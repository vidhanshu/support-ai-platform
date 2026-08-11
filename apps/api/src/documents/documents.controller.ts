import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import { WorkspaceRole } from "@repo/database";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";

@RequireWorkspace()
@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("upload-url")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  uploadUrl(
    @Body() dto: CreateUploadUrlDto,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.documentsService.uploadUrl(workspace, dto);
  }

  @Post(":id/complete")
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  complete(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("id") documentId: string,
  ) {
    return this.documentsService.complete(workspace, documentId);
  }

  @Get(":id/download-url")
  getDownloadUrl(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("id") documentId: string,
  ) {
    return this.documentsService.getDownloadUrl(workspace, documentId);
  }

  @Get()
  findAll(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.documentsService.findAll(workspace);
  }
}
