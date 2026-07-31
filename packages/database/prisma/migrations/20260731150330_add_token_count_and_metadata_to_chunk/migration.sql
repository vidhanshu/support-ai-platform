-- AlterTable
ALTER TABLE "Chunk" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tokenCount" INTEGER NOT NULL DEFAULT 0;
