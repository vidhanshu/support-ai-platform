-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
