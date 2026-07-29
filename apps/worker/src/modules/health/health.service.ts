import { Injectable } from "@nestjs/common";
import { PrismaService } from "@repo/database";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<{ status: string; database: string; role: string }> {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      database: "up",
      role: "worker",
    };
  }
}
