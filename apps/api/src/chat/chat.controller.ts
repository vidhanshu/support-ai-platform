import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
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
  sendMessage(
    @Body() dto: SendMessageDto,
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
    @CurrentWorkspace() workspace: WorkspaceContext,
  ) {
    return this.chatService.sendMessage(workspace, user, agentId, dto);
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.chatService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.chatService.remove(+id);
  }
}
