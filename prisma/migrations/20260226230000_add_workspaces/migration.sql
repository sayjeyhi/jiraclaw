-- CreateTable Workspace
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable WorkspaceMember
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
CREATE UNIQUE INDEX "WorkspaceMember_userId_workspaceId_key" ON "WorkspaceMember"("userId", "workspaceId");

-- Insert default workspace
INSERT INTO "Workspace" ("id", "name", "slug") VALUES ('ws-default', 'Default Workspace', 'default');

-- Add workspace members for existing users
INSERT INTO "WorkspaceMember" ("id", "userId", "workspaceId", "role")
SELECT 'wm-' || "id", "id", 'ws-default', 'owner' FROM "User";

-- Add workspaceId to BotConfig
ALTER TABLE "BotConfig" ADD COLUMN "workspaceId" TEXT;
UPDATE "BotConfig" SET "workspaceId" = 'ws-default';
ALTER TABLE "BotConfig" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "BotConfig" ADD CONSTRAINT "BotConfig_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add workspaceId to JiraProject
ALTER TABLE "JiraProject" ADD COLUMN "workspaceId" TEXT;
UPDATE "JiraProject" SET "workspaceId" = 'ws-default';
ALTER TABLE "JiraProject" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "JiraProject" ADD CONSTRAINT "JiraProject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old unique, add composite
DROP INDEX IF EXISTS "JiraProject_key_key";
CREATE UNIQUE INDEX "JiraProject_workspaceId_key_key" ON "JiraProject"("workspaceId", "key");

-- Add workspaceId to AIProvider
ALTER TABLE "AIProvider" ADD COLUMN "workspaceId" TEXT;
UPDATE "AIProvider" SET "workspaceId" = 'ws-default';
ALTER TABLE "AIProvider" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "AIProvider" ADD CONSTRAINT "AIProvider_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "AIProvider_slug_key";
CREATE UNIQUE INDEX "AIProvider_workspaceId_slug_key" ON "AIProvider"("workspaceId", "slug");

-- Add workspaceId to SystemPrompt
ALTER TABLE "SystemPrompt" ADD COLUMN "workspaceId" TEXT;
UPDATE "SystemPrompt" SET "workspaceId" = 'ws-default';
ALTER TABLE "SystemPrompt" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "SystemPrompt" ADD CONSTRAINT "SystemPrompt_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add workspaceId to ChannelConfig
ALTER TABLE "ChannelConfig" ADD COLUMN "workspaceId" TEXT;
UPDATE "ChannelConfig" SET "workspaceId" = 'ws-default';
ALTER TABLE "ChannelConfig" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "ChannelConfig" ADD CONSTRAINT "ChannelConfig_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "ChannelConfig_slug_key";
CREATE UNIQUE INDEX "ChannelConfig_workspaceId_slug_key" ON "ChannelConfig"("workspaceId", "slug");

-- Add workspaceId to BotTicket
ALTER TABLE "BotTicket" ADD COLUMN "workspaceId" TEXT;
UPDATE "BotTicket" SET "workspaceId" = 'ws-default';
ALTER TABLE "BotTicket" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "BotTicket" ADD CONSTRAINT "BotTicket_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add workspaceId to LogEntry
ALTER TABLE "LogEntry" ADD COLUMN "workspaceId" TEXT;
UPDATE "LogEntry" SET "workspaceId" = 'ws-default';
ALTER TABLE "LogEntry" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add WorkspaceMember foreign keys
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
