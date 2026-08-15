import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QUEUE_CONFIGS } from "@repo/config";
import Redis from "ioredis";

@Injectable()
export class ApiKeyRateLimitService implements OnModuleDestroy {
  private readonly redis: Redis;
  private connecting: Promise<void> | null = null;

  constructor(config: ConfigService) {
    this.redis = new Redis({
      host: config.getOrThrow(QUEUE_CONFIGS.REDIS.HOST),
      port: Number(config.getOrThrow(QUEUE_CONFIGS.REDIS.PORT)),
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => undefined);
  }

  private async ensureConnected() {
    if (this.redis.status === "ready") return;
    if (!this.connecting) {
      this.connecting = this.redis
        .connect()
        .catch(() => undefined)
        .finally(() => {
          this.connecting = null;
        });
    }
    await this.connecting;
  }

  /** Fixed-window RPM limiter. Throws 429 when over limit. */
  async assertWithinLimit(apiKeyId: string, rpm: number): Promise<void> {
    await this.ensureConnected();

    const windowSec = 60;
    const key = `api_key_rpm:${apiKeyId}:${Math.floor(Date.now() / 1000 / windowSec)}`;
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowSec);
    }

    if (count > rpm) {
      const ttl = await this.redis.ttl(key);
      const retryAfter = Math.max(ttl, 1);
      throw new HttpException(
        {
          message: "Rate limit exceeded",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
