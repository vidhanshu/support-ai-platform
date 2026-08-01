import { Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@repo/database";
import { EmbeddedChunk } from '@repo/contracts';

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
        ${crypto.randomUUID()},
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
}
