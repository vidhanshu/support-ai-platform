import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "@repo/database";
import { getRootEnvPath, QUEUE_CONFIGS, QUEUE_NAMES } from "@repo/config";
import { HealthModule } from "./modules/health/health.module";
import { BullModule } from "@nestjs/bullmq";
import { DocumentsModule } from './documents/documents.module';

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
    BullModule.registerQueue({
      name: QUEUE_NAMES.DOCUMENT_PROCESSING,
    }),
    PrismaModule,
    HealthModule,
    DocumentsModule,
  ],
})
export class AppModule {}
