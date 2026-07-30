import "reflect-metadata"; // It loads the reflect-metadata polyfill once at startup.
import { config as loadEnv } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { getRootEnvPath } from "@repo/config";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

loadEnv({ path: getRootEnvPath() });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>("API_PORT") ?? 3001);

  // cors
  app.enableCors({
    origin: ["http://localhost:3000"],
  });

  // validation — transform is required for whitelist + class-validator to run
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // enable URI versioning globally
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1", // Sets 'v1' as the default prefix for all routes
  });

  // global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // logger
  app.useLogger(["log", "error", "warn", "debug", "verbose"]);
  
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
