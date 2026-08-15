import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@repo/database";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import { CreateAgentApiKeyDto } from "./dto/create-agent-api-key.dto";
import { generateApiKeySecret } from "./api-key.utils";

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private async assertAgentInWorkspace(workspaceId: string, agentId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, workspaceId },
      select: { id: true },
    });
    if (!agent) throw new NotFoundException("Agent not found");
  }

  async list(workspace: WorkspaceContext, agentId: string) {
    await this.assertAgentInWorkspace(workspace.id, agentId);

    return this.prisma.agentApiKey.findMany({
      where: { agentId, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        allowedOrigins: true,
        rateLimitRpm: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  async create(
    workspace: WorkspaceContext,
    agentId: string,
    dto: CreateAgentApiKeyDto,
  ) {
    await this.assertAgentInWorkspace(workspace.id, agentId);

    const isProd = this.config.get<string>("NODE_ENV") === "production";
    const { rawKey, keyPrefix, keyHash } = generateApiKeySecret(isProd);

    const origins = dto.allowedOrigins.map((o) => o.replace(/\/$/, ""));

    const record = await this.prisma.agentApiKey.create({
      data: {
        agentId,
        name: dto.name.trim(),
        keyPrefix,
        keyHash,
        allowedOrigins: origins,
        rateLimitRpm: dto.rateLimitRpm ?? 60,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        allowedOrigins: true,
        rateLimitRpm: true,
        createdAt: true,
      },
    });

    return {
      ...record,
      /** Shown only once — store it securely. */
      secret: rawKey,
    };
  }

  async revoke(workspace: WorkspaceContext, agentId: string, keyId: string) {
    await this.assertAgentInWorkspace(workspace.id, agentId);

    const key = await this.prisma.agentApiKey.findFirst({
      where: { id: keyId, agentId, revokedAt: null },
    });
    if (!key) throw new NotFoundException("API key not found");

    await this.prisma.agentApiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return { id: keyId };
  }
}
