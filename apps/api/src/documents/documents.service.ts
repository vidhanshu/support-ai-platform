import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import { DocumentStatus, PrismaService } from "@repo/database";
import { StorageService } from "@repo/storage";
import { InjectQueue } from "@nestjs/bullmq";
import { JOB_NAMES, MIME_TYPE_TO_EXTENSION, QUEUE_NAMES } from "@repo/config";
import type { Queue } from "bullmq";

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue(QUEUE_NAMES.DOCUMENT_PROCESSING) private readonly queue: Queue,
  ) {}

  async uploadUrl(workspace: WorkspaceContext, dto: CreateUploadUrlDto) {
    const { contentType, originalName, size } = dto;
    const documentId = crypto.randomUUID();

    const extension =
      MIME_TYPE_TO_EXTENSION[
        contentType as keyof typeof MIME_TYPE_TO_EXTENSION
      ];
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

    // add to queue
    await this.queue.add(JOB_NAMES.PROCESS_DOCUMENT, {
      documentId,
    });

    return updatedDoc;
  }

  async findAll(workspace: WorkspaceContext) {
    return this.prisma.document.findMany({
      where: {
        workspaceId: workspace.id,
      },
    });
  }

  async remove(workspace: WorkspaceContext, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException("Document not found");
    if (doc.workspaceId !== workspace.id) throw new UnauthorizedException();

    await this.prisma.document.delete({ where: { id } });
    await this.storageService.deleteObject(doc.objectKey);

    // TODO: delete the chunks from vector db

    return doc;
  }
}
