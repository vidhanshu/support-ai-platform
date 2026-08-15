import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type {
  PublicAgentContext,
  PublicApiKeyContext,
  PublicApiRequest,
} from "../../common/interfaces/request.interface";

export const CurrentApiKey = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PublicApiKeyContext => {
    const req = ctx.switchToHttp().getRequest<PublicApiRequest>();
    return req.apiKey;
  },
);

export const CurrentPublicAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PublicAgentContext => {
    const req = ctx.switchToHttp().getRequest<PublicApiRequest>();
    return req.publicAgent;
  },
);
