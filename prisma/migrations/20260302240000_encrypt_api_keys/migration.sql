-- AlterTable: Replace apiKey with encryptedApiKey and maskedApiKey
-- Step 1: Add new columns
ALTER TABLE "AIProvider" ADD COLUMN IF NOT EXISTS "encryptedApiKey" TEXT;
ALTER TABLE "AIProvider" ADD COLUMN IF NOT EXISTS "maskedApiKey" TEXT;

-- Step 2: Drop old apiKey column (run data migration script first if you have existing keys to preserve)
ALTER TABLE "AIProvider" DROP COLUMN IF EXISTS "apiKey";
