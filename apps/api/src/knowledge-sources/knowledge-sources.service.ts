import { Injectable, NotFoundException } from "@nestjs/common";
import { WorkspaceContext } from "../common/interfaces/request.interface";
import { PrismaService } from "@repo/database";
import { StorageService } from "@repo/storage";

@Injectable()
export class KnowledgeSourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(workspace: WorkspaceContext) {
    return this.prisma.knowledgeSource.findMany({
      where: { workspaceId: workspace.id },
      include: {
        document: true,
        website: true,
        agents: {
          include: {
            agent: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} knowledge`;
  }

  async remove(workspace: WorkspaceContext, id: string) {
    const knowledgeSource = await this.prisma.knowledgeSource.findFirst({
      where: { id, workspaceId: workspace.id },
      include: { document: true },
    });

    if (!knowledgeSource) {
      throw new NotFoundException("Knowledge source not found");
    }

    const objectKey = knowledgeSource.document?.objectKey;

    await this.prisma.knowledgeSource.delete({ where: { id } });

    if (objectKey) {
      await this.storageService.deleteObject(objectKey);
    }

    return { id };
  }
}
