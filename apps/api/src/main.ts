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
  const app = await NestFactory.create(AppModule, {
    // Required for Stripe webhook signature verification
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>("API_PORT") ?? 3001);

  // CORS: dashboard origins from env; other origins are reflected so embed
  // sites can call /v1/public/* (ApiKeyGuard enforces each key's allowedOrigins).
  const allowedOrigins =
    configService
      .get<string>("ALLOWED_ORIGINS")
      ?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? [];

  const isProd = configService.get<string>("NODE_ENV") === "production";

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void,
    ) => {
      // No Origin (curl / server-to-server) — allow
      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalDevOrigin =
        origin === "http://localhost:3000" ||
        /^http:\/\/localhost:\d+$/.test(origin);

      if (!isProd && isLocalDevOrigin) {
        // Must pass the origin string so ACAO is set correctly
        callback(null, origin);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
        return;
      }

      // Reflect for public widget origins — restricted per API key in ApiKeyGuard
      callback(null, origin);
    },
    // Include every custom request header the dashboard/SDK may send
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "Accept",
      "X-Api-Key",
      "x-workspace-id",
      "ngrok-skip-browser-warning",
    ],
    exposedHeaders: ["Retry-After"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
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
