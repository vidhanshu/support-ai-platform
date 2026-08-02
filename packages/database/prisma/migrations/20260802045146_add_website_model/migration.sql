-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "rootUrl" TEXT NOT NULL,
    "allowedHosts" TEXT[],
    "maxPages" INTEGER NOT NULL DEFAULT 50,
    "crawlDepth" INTEGER NOT NULL DEFAULT 2,
    "pagesFound" INTEGER NOT NULL DEFAULT 0,
    "pagesCrawled" INTEGER NOT NULL DEFAULT 0,
    "lastCrawledAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "knowledgeSourceId" TEXT NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Website_knowledgeSourceId_key" ON "Website"("knowledgeSourceId");

-- CreateIndex
CREATE INDEX "Website_knowledgeSourceId_idx" ON "Website"("knowledgeSourceId");

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
