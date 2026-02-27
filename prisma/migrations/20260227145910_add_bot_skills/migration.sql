-- AlterTable
ALTER TABLE "BotConfig" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "botSkillDescription" SET DEFAULT '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
