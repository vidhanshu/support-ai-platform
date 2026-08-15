import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "@repo/database";
import type { Request, Response } from "express";
import {
  extractBearerOrApiKey,
  hashApiKey,
} from "../../api-keys/api-key.utils";
import type {
  PublicAgentContext,
  PublicApiKeyContext,
  PublicApiRequest,
} from "../../common/interfaces/request.interface";
import { ApiKeyRateLimitService } from "../api-key-rate-limit.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimit: ApiKeyRateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const agentId = req.params.agentId as string | undefined;
    if (!agentId) {
      throw new UnauthorizedException("Missing agent id");
    }

    const rawKey = extractBearerOrApiKey(
      req.headers.authorization,
      typeof req.headers["x-api-key"] === "string"
        ? req.headers["x-api-key"]
        : undefined,
    );
    if (!rawKey) {
      throw new UnauthorizedException("Missing API key");
    }

    const keyHash = hashApiKey(rawKey);
    const record = await this.prisma.agentApiKey.findFirst({
      where: { keyHash, revokedAt: null },
      include: {
        agent: {
          select: {
            id: true,
            workspaceId: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });

    if (!record || record.agentId !== agentId) {
      throw new UnauthorizedException("Invalid API key");
    }

    if (!record.agent.isActive) {
      throw new ForbiddenException("Agent is inactive");
    }

    const origin = req.headers.origin;
    if (origin) {
      const normalized = origin.replace(/\/$/, "");
      const allowed = record.allowedOrigins.map((o) => o.replace(/\/$/, ""));
      if (!allowed.includes(normalized)) {
        throw new ForbiddenException(
          `Origin not allowed for this API key: ${origin}`,
        );
      }
    }

    try {
      await this.rateLimit.assertWithinLimit(record.id, record.rateLimitRpm);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "getResponse" in error &&
        typeof (error as { getResponse: () => unknown }).getResponse ===
          "function"
      ) {
        const body = (error as { getResponse: () => unknown }).getResponse();
        if (
          body &&
          typeof body === "object" &&
          "retryAfter" in body &&
          typeof (body as { retryAfter: unknown }).retryAfter === "number"
        ) {
          res.setHeader(
            "Retry-After",
            String((body as { retryAfter: number }).retryAfter),
          );
        }
      }
      throw error;
    }

    const apiKey: PublicApiKeyContext = {
      id: record.id,
      agentId: record.agentId,
      workspaceId: record.agent.workspaceId,
      allowedOrigins: record.allowedOrigins,
      rateLimitRpm: record.rateLimitRpm,
    };
    const publicAgent: PublicAgentContext = {
      id: record.agent.id,
      workspaceId: record.agent.workspaceId,
      name: record.agent.name,
      description: record.agent.description,
      isActive: record.agent.isActive,
    };

    (req as PublicApiRequest).apiKey = apiKey;
    (req as PublicApiRequest).publicAgent = publicAgent;

    void this.prisma.agentApiKey
      .update({
        where: { id: record.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => undefined);

    return true;
  }
}
