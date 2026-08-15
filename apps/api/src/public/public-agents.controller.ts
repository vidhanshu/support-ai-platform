import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { ChatService, type ChatStreamEvent } from "../chat/chat.service";
import { SendMessageDto } from "../chat/dto/send-message.dto";
import { CurrentPublicAgent } from "./decorators/current-api-key.decorator";
import type { PublicAgentContext } from "../common/interfaces/request.interface";
import { ApiKeyGuard } from "./guards/api-key.guard";

@UseGuards(ApiKeyGuard)
@Controller("public/agents/:agentId")
export class PublicAgentsController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getAgent(@CurrentPublicAgent() agent: PublicAgentContext) {
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
    };
  }

  @Post("chat")
  async chat(
    @Param("agentId") agentId: string,
    @CurrentPublicAgent() agent: PublicAgentContext,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    try {
      const stream = this.chatService.streamPublicMessage(
        agent.workspaceId,
        agentId,
        dto,
      );

      for await (const event of stream) {
        if (!res.headersSent) {
          this.initSse(res);
        }
        this.writeSse(res, event);
      }
    } catch (error) {
      if (!res.headersSent) {
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
          error instanceof HttpException
            ? error.message
            : "Internal server error";

        res.status(status).json({
          success: false,
          statusCode: status,
          message,
        });
        return;
      }

      this.writeSse(res, {
        type: "error",
        data: {
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      });
    } finally {
      if (res.headersSent && !res.writableEnded) {
        res.end();
      }
    }
  }

  private initSse(res: Response) {
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
  }

  private writeSse(res: Response, event: ChatStreamEvent) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (typeof (res as Response & { flush?: () => void }).flush === "function") {
      (res as Response & { flush: () => void }).flush();
    }
  }
}
