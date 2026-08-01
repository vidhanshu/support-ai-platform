/*
  Warnings:

  - You are about to drop the column `documentId` on the `Chunk` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `AgentDocument` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[objectKey]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[knowledgeSourceId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `knowledgeSourceId` to the `Chunk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `knowledgeSourceId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFilename` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('DOCUMENT', 'QNA', 'WEBSITE', 'NOTION', 'TICKET');

-- CreateEnum
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('UPLOADING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_createdById_fkey";

-- DropForeignKey
ALTER TABLE "AgentDocument" DROP CONSTRAINT "AgentDocument_agentId_fkey";

-- DropForeignKey
ALTER TABLE "AgentDocument" DROP CONSTRAINT "AgentDocument_documentId_fkey";

-- DropForeignKey
ALTER TABLE "Chunk" DROP CONSTRAINT "Chunk_documentId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_workspaceId_fkey";

-- DropIndex
DROP INDEX "Document_workspaceId_idx";

-- AlterTable
ALTER TABLE "Chunk" DROP COLUMN "documentId",
ADD COLUMN     "knowledgeSourceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "name",
DROP COLUMN "status",
DROP COLUMN "workspaceId",
ADD COLUMN     "knowledgeSourceId" TEXT NOT NULL,
ADD COLUMN     "originalFilename" TEXT NOT NULL,
ADD COLUMN     "uploadStatus" "UploadStatus" NOT NULL DEFAULT 'UPLOADING';

-- DropTable
DROP TABLE "AgentDocument";

-- DropEnum
DROP TYPE "DocumentStatus";

-- CreateTable
CREATE TABLE "AgentKnowledgeSource" (
    "id" TEXT NOT NULL,
    "knowledgeSourceId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "attachedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentKnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentKnowledgeSource_agentId_idx" ON "AgentKnowledgeSource"("agentId");

-- CreateIndex
CREATE INDEX "AgentKnowledgeSource_knowledgeSourceId_idx" ON "AgentKnowledgeSource"("knowledgeSourceId");

-- CreateIndex
CREATE INDEX "AgentKnowledgeSource_attachedById_idx" ON "AgentKnowledgeSource"("attachedById");

-- CreateIndex
CREATE UNIQUE INDEX "AgentKnowledgeSource_agentId_knowledgeSourceId_key" ON "AgentKnowledgeSource"("agentId", "knowledgeSourceId");

-- CreateIndex
CREATE INDEX "KnowledgeSource_workspaceId_idx" ON "KnowledgeSource"("workspaceId");

-- CreateIndex
CREATE INDEX "Agent_createdById_idx" ON "Agent"("createdById");

-- CreateIndex
CREATE INDEX "Chunk_knowledgeSourceId_idx" ON "Chunk"("knowledgeSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_objectKey_key" ON "Document"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "Document_knowledgeSourceId_key" ON "Document"("knowledgeSourceId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentKnowledgeSource" ADD CONSTRAINT "AgentKnowledgeSource_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentKnowledgeSource" ADD CONSTRAINT "AgentKnowledgeSource_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentKnowledgeSource" ADD CONSTRAINT "AgentKnowledgeSource_attachedById_fkey" FOREIGN KEY ("attachedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
