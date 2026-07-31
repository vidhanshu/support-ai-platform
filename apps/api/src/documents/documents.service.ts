import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import { DocumentStatus, PrismaService } from "@repo/database";
import path from "path";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadUrl(workspace: WorkspaceContext, dto: CreateUploadUrlDto) {
    const { contentType, originalName, size } = dto;
    const documentId = crypto.randomUUID();

    const extension = path.extname(originalName);
    const objectKey = `workspaces/${workspace.slug}/documents/${documentId}${extension}`;

    const document = await this.prisma.document.create({
      data: {
        id: documentId,
        mimeType: contentType,
        name: originalName,
        size: size,
        objectKey: objectKey,
        workspaceId: workspace.id,
        status: DocumentStatus.UPLOADING,
      },
    });

    const uploadUrl = await this.storageService.generateUploadUrl(
      objectKey,
      contentType,
    );
    return {
      document,
      uploadUrl,
    };
  }

  async complete(workspace: WorkspaceContext, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { workspaceId: workspace.id, id: documentId },
    });
    if (!doc) throw new NotFoundException("Document not found");
    if (doc.status !== DocumentStatus.UPLOADING)
      throw new BadRequestException("Document upload already completed");

    const objectExists = await this.storageService.objectExists(doc.objectKey);
    if (!objectExists) throw new BadRequestException("Uploaded file not found");

    const updatedDoc = await this.prisma.document.update({
      where: { id: documentId, status: DocumentStatus.UPLOADING },
      data: { status: DocumentStatus.PROCESSING },
    });

    // TODO:
    // await this.ingestionQueue.add(...)

    return updatedDoc;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
