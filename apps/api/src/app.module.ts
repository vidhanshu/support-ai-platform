import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "@repo/database";
import { getRootEnvPath } from "@repo/config";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getRootEnvPath(),
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    WorkspaceModule,
  ],
})
export class AppModule {}
