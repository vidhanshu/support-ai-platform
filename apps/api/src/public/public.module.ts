import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { ApiKeyRateLimitService } from "./api-key-rate-limit.service";
import { ApiKeyGuard } from "./guards/api-key.guard";
import { PublicAgentsController } from "./public-agents.controller";

@Module({
  imports: [ChatModule],
  controllers: [PublicAgentsController],
  providers: [ApiKeyGuard, ApiKeyRateLimitService],
})
export class PublicModule {}
