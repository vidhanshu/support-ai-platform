-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "model" SET DEFAULT 'openai/gpt-oss-20b';

-- Normalize unknown models; keep Groq + local Ollama qwen options
UPDATE "Agent" SET "model" = 'openai/gpt-oss-20b'
WHERE "model" IS NULL
   OR "model" NOT IN (
     'openai/gpt-oss-20b',
     'openai/gpt-oss-120b',
     'llama-3.1-8b-instant',
     'qwen2.5:3b'
   );
