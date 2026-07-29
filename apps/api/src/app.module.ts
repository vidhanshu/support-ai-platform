import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "@repo/database";
import { getRootEnvPath } from "@repo/config";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getRootEnvPath(),
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
