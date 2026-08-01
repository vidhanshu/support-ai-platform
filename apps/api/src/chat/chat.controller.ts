import {
  Controller,
  Post,
  Body,
  Param,
  Res,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { ChatService, type ChatStreamEvent } from "./chat.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import type { JwtUser } from "../auth/interfaces/jwt.interface";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import type { WorkspaceContext } from "../common/interfaces/request.interface";

@Controller("agents/:agentId/chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @RequireWorkspace()
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Res() res: Response,
  ) {
    try {
      const stream = this.chatService.streamMessage(
        workspace,
        user,
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
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event.data)}\n\n`);
  }
}
