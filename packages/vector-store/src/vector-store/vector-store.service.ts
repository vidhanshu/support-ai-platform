import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@repo/database";
import type { EmbeddedChunk } from "@repo/contracts";

@Injectable()
export class VectorStoreService {
  constructor(private readonly prisma: PrismaService) {}

  private vectorToSql(vector: number[]) {
    return `[${vector.join(",")}]`;
  }

  async store(embeddedChunks: EmbeddedChunk[], knowledgeSourceId: string) {
    if (embeddedChunks.length === 0) {
      return;
    }

    const values = embeddedChunks.map(
      (chunk) => Prisma.sql`(
        ${randomUUID()},
        ${chunk.text},
        ${chunk.index},
        ${this.vectorToSql(chunk.embedding)}::vector,
        ${chunk.tokenCount},
        ${chunk.metadata ? JSON.stringify(chunk.metadata) : null},
        ${knowledgeSourceId},
        NOW(),
        NOW()
      )`,
    );

    return this.prisma.$executeRaw`
      INSERT INTO "Chunk"
      ("id","text","chunkIndex","embedding","tokenCount","metadata","knowledgeSourceId","createdAt","updatedAt")
      VALUES ${Prisma.join(values)}
    `;
  }

  async search(
    embeddedQuery: number[],
    knowledgeSourceIds: string[],
    limit: number = 10,
  ) {
    if (knowledgeSourceIds.length === 0) {
      return [];
    }

    return this.prisma.$queryRaw`
      SELECT *
      FROM "Chunk"
      WHERE "knowledgeSourceId" IN (${Prisma.join(knowledgeSourceIds)})
      ORDER BY "embedding" <=> ${this.vectorToSql(embeddedQuery)}::vector ASC
      LIMIT ${limit}
    `;
  }
}
