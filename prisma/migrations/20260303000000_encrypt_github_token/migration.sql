-- AlterTable: Replace githubToken with encryptedGithubToken and maskedGithubToken
-- Step 1: Add new columns
ALTER TABLE "BotConfig" ADD COLUMN IF NOT EXISTS "encryptedGithubToken" TEXT;
ALTER TABLE "BotConfig" ADD COLUMN IF NOT EXISTS "maskedGithubToken" TEXT;

-- Step 2: Drop old column (existing plaintext tokens cannot be migrated automatically; users will need to re-enter)
ALTER TABLE "BotConfig" DROP COLUMN IF EXISTS "githubToken";
