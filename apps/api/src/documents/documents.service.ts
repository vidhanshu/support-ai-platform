import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
  PrismaService,
  UploadStatus,
} from "@repo/database";
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

    const knowledgeSource = await this.prisma.knowledgeSource.create({
      data: {
        workspaceId: workspace.id,
        type: KnowledgeSourceType.DOCUMENT,
        status: KnowledgeSourceStatus.PENDING,
        name: originalName,
        document: {
          create: {
            id: documentId,
            mimeType: contentType,
            originalFilename: originalName,
            size: size,
            objectKey: objectKey,
            uploadStatus: UploadStatus.UPLOADING,
          },
        },
      },
      include: {
        document: true,
      },
    });

    const uploadUrl = await this.storageService.generateUploadUrl(
      objectKey,
      contentType,
    );

    return {
      document: knowledgeSource.document,
      uploadUrl,
    };
  }

  async complete(workspace: WorkspaceContext, documentId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, knowledgeSource: { workspaceId: workspace.id } },
    });

    if (!doc) throw new NotFoundException("Document not found");
    if (doc.uploadStatus !== UploadStatus.UPLOADING)
      throw new BadRequestException("Document upload already completed");

    const objectExists = await this.storageService.objectExists(doc.objectKey);
    if (!objectExists) throw new BadRequestException("Uploaded file not found");

    const knowledgeSource = await this.prisma.knowledgeSource.update({
      where: { id: doc.knowledgeSourceId },
      data: {
        status: KnowledgeSourceStatus.PROCESSING,
        document: {
          update: {
            where: { uploadStatus: UploadStatus.UPLOADING },
            data: {
              uploadStatus: UploadStatus.COMPLETED,
            },
          },
        },
      },
      include: {
        document: true,
      },
    });

    // add to queue
    await this.queue.add(JOB_NAMES.PROCESS_DOCUMENT, {
      documentId,
    });

    return knowledgeSource.document;
  }

  async findAll(workspace: WorkspaceContext) {
    return this.prisma.document.findMany({
      where: {
        knowledgeSource: { workspaceId: workspace.id },
      },
    });
  }
}
