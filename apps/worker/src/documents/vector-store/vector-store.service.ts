import { Injectable } from "@nestjs/common";
import { EmbeddedChunk } from "../../interfaces";
import { Prisma, PrismaService } from "@repo/database";

@Injectable()
export class VectorStoreService {
  constructor(private readonly prisma: PrismaService) {}

  private vectorToSql(vector: number[]) {
    return `[${vector.join(",")}]`;
  }

  async store(embeddedChunks: EmbeddedChunk[], documentId: string) {
    if (embeddedChunks.length === 0) {
      return;
    }

    const values = embeddedChunks.map(
      (chunk) => Prisma.sql`(
        ${crypto.randomUUID()},
        ${chunk.text},
        ${chunk.index},
        ${this.vectorToSql(chunk.embedding)}::vector,
        ${documentId},
        NOW(),
        NOW()
      )`,
    );

    return this.prisma.$executeRaw`
      INSERT INTO "Chunk"
      ("id","text","chunkIndex","embedding","documentId","createdAt","updatedAt")
      VALUES ${Prisma.join(values)}
    `;
  }
}
