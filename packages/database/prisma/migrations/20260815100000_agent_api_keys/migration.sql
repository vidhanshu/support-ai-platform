-- CreateTable
CREATE TABLE "AgentApiKey" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "allowedOrigins" TEXT[],
    "rateLimitRpm" INTEGER NOT NULL DEFAULT 60,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentApiKey_keyHash_key" ON "AgentApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "AgentApiKey_agentId_idx" ON "AgentApiKey"("agentId");

-- CreateIndex
CREATE INDEX "AgentApiKey_keyHash_idx" ON "AgentApiKey"("keyHash");

-- AddForeignKey
ALTER TABLE "AgentApiKey" ADD CONSTRAINT "AgentApiKey_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
