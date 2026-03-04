-- AlterTable: Add globalPromptId for storing base prompt; systemPromptId remains for bot-specific override
ALTER TABLE "BotConfig" ADD COLUMN IF NOT EXISTS "globalPromptId" TEXT;
