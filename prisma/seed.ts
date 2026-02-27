import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  initialBots,
  initialJiraProjects,
  initialProviders,
  initialPrompts,
  initialChannels,
  initialTickets,
  initialLogs,
} from "../lib/store";
import { ADMIN_PERMISSIONS, DEFAULT_USER_PERMISSIONS } from "../lib/types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const WORKSPACE_ID = "ws-seed";

async function main() {
  // Seed workspace (dev only)
  await prisma.workspace.upsert({
    where: { id: WORKSPACE_ID },
    update: {},
    create: {
      id: WORKSPACE_ID,
      name: "Seed Workspace",
      slug: "seed",
    },
  });

  // Users (created before memberships so FK is satisfied)
  await prisma.user.upsert({
    where: { id: "user-1" },
    update: {},
    create: {
      id: "user-1",
      name: "Sarah Chen",
      email: "sarah.chen@jiraclaw.ai",
      role: "admin",
      permissions: ADMIN_PERMISSIONS as object,
      avatarUrl:
        "https://www.gravatar.com/avatar/6f3b47c0e1e7a5d2f3e2a1b9c8d7e6f5?d=identicon&s=80",
      createdAt: new Date("2025-11-01T08:00:00Z"),
    },
  });
  await prisma.user.upsert({
    where: { id: "user-2" },
    update: {},
    create: {
      id: "user-2",
      name: "Alex Rivera",
      email: "alex.r@jiraclaw.ai",
      role: "user",
      permissions: {
        ...DEFAULT_USER_PERMISSIONS,
        bots: { view: true, create: true, edit: true, delete: false },
        jira: { view: true, create: true, edit: false, delete: false },
      } as object,
      createdAt: new Date("2026-01-10T14:00:00Z"),
    },
  });
  await prisma.user.upsert({
    where: { id: "user-3" },
    update: {},
    create: {
      id: "user-3",
      name: "Jordan Kim",
      email: "j.kim@jiraclaw.ai",
      role: "user",
      permissions: DEFAULT_USER_PERMISSIONS as object,
      createdAt: new Date("2026-02-05T09:30:00Z"),
    },
  });

  // Workspace members for seed users
  for (const userId of ["user-1", "user-2", "user-3"]) {
    await prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId, workspaceId: WORKSPACE_ID } },
      update: {},
      create: { id: `wm-${userId}`, userId, workspaceId: WORKSPACE_ID, role: "owner" },
    });
  }

  // AI Providers
  for (const p of initialProviders) {
    await prisma.aIProvider.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        workspaceId: WORKSPACE_ID,
        name: p.name,
        slug: p.slug,
        apiKey: p.apiKey,
        enabled: p.enabled,
        models: p.models as object,
      },
    });
  }

  // Channels
  for (const c of initialChannels) {
    await prisma.channelConfig.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        workspaceId: WORKSPACE_ID,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        enabled: c.enabled,
        credentials: c.credentials as object,
        botOverrides: c.botOverrides as object,
      },
    });
  }

  // Prompts
  for (const p of initialPrompts) {
    await prisma.systemPrompt.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        workspaceId: WORKSPACE_ID,
        name: p.name,
        content: p.content,
        isGlobal: p.isGlobal,
        botOverrides: (p.botOverrides ?? {}) as object,
        updatedAt: new Date(p.updatedAt),
        createdAt: new Date(p.createdAt),
      },
    });
  }

  // Bots
  for (const b of initialBots) {
    await prisma.botConfig.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        workspaceId: WORKSPACE_ID,
        title: b.title,
        email: b.email,
        botSkillDescription: b.botSkillDescription,
        status: b.status,
        defaultProvider: b.defaultProvider,
        defaultModel: b.defaultModel,
        githubToken: b.githubToken,
        spendingLimit: b.spendingLimit,
        autonomyLevel: b.autonomyLevel,
        supervisedSettings: b.supervisedSettings as object,
        systemPromptId: b.systemPromptId,
        enabledChannels: b.enabledChannels,
        createdAt: new Date(b.createdAt),
      },
    });
  }

  // Jira Projects
  for (const p of initialJiraProjects) {
    await prisma.jiraProject.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        workspaceId: WORKSPACE_ID,
        name: p.name,
        key: p.key,
        url: p.url,
        apiKey: p.apiKey,
        repositories: p.repositories as object,
        labelMappings: p.labelMappings as object,
        botId: p.botId,
        status: p.status,
      },
    });
  }

  // Tickets
  for (const t of initialTickets) {
    await prisma.botTicket.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        workspaceId: WORKSPACE_ID,
        key: t.key,
        summary: t.summary,
        status: t.status,
        priority: t.priority,
        botId: t.botId,
        assignedAt: new Date(t.assignedAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
        branch: t.branch,
        repoName: t.repoName,
        channelMessages: t.channelMessages as object,
        actions: t.actions as object,
      },
    });
  }

  // Logs
  for (const l of initialLogs) {
    await prisma.logEntry.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        workspaceId: WORKSPACE_ID,
        service: l.service,
        level: l.level,
        message: l.message,
        timestamp: new Date(l.timestamp),
        botId: l.botId,
        projectId: l.projectId,
        repoName: l.repoName,
        metadata: (l.metadata ?? {}) as object,
      },
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
