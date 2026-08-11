-- AlterEnum
ALTER TYPE "KnowledgeSourceType" ADD VALUE 'TEXT_SNIPPET';

-- CreateTable
CREATE TABLE "TextSnippet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "contentBytes" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "knowledgeSourceId" TEXT NOT NULL,

    CONSTRAINT "TextSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TextSnippet_knowledgeSourceId_key" ON "TextSnippet"("knowledgeSourceId");

-- CreateIndex
CREATE INDEX "TextSnippet_knowledgeSourceId_idx" ON "TextSnippet"("knowledgeSourceId");

-- AddForeignKey
ALTER TABLE "TextSnippet" ADD CONSTRAINT "TextSnippet_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
