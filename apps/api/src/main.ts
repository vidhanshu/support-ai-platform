import { config as loadEnv } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { getRootEnvPath } from "@repo/config";
import { AppModule } from "./app.module";

loadEnv({ path: getRootEnvPath() });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>("API_PORT") ?? 3001);

  app.enableCors({
    origin: ["http://localhost:3000"],
    methods: ["*"],
    allowedHeaders: ["*"],
    credentials: true,
  });
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
