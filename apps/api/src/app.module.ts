import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "@repo/database";
import { getRootEnvPath, QUEUE_CONFIGS } from "@repo/config";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./auth/auth.module";
import { WorkspaceModule } from "./workspace/workspace.module";
import { AgentsModule } from "./agents/agents.module";
import { InvitationsModule } from "./invitations/invitations.module";
import { DocumentsModule } from "./documents/documents.module";
import { CommonModule } from "./common/common.module";
import { BullModule } from "@nestjs/bullmq";
import { ChatModule } from './chat/chat.module';
import { ConversationModule } from './conversation/conversation.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getRootEnvPath(),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow(QUEUE_CONFIGS.REDIS.HOST),
          port: Number(config.getOrThrow(QUEUE_CONFIGS.REDIS.PORT)),
        },
      }),
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    WorkspaceModule,
    AgentsModule,
    InvitationsModule,
    DocumentsModule,
    CommonModule,
    ChatModule,
    ConversationModule,
    KnowledgeModule,
  ],
})
export class AppModule {}
