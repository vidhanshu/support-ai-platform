-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "model" SET DEFAULT 'qwen2.5:3b';

-- Normalize existing agents to the supported chat model
UPDATE "Agent" SET "model" = 'qwen2.5:3b'
WHERE "model" IS NULL
   OR "model" NOT IN ('qwen2.5:3b');
