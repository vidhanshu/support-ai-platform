-- Split Agent.systemPrompt into generalPrompt + guardrailsPrompt.
-- Preserve existing prompt content in generalPrompt.

ALTER TABLE "Agent" ADD COLUMN "generalPrompt" TEXT;
ALTER TABLE "Agent" ADD COLUMN "guardrailsPrompt" TEXT;

UPDATE "Agent" SET "generalPrompt" = "systemPrompt" WHERE "systemPrompt" IS NOT NULL;

ALTER TABLE "Agent" DROP COLUMN "systemPrompt";
