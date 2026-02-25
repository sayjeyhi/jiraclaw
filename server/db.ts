import {
  initialBots,
  initialJiraProjects,
  initialProviders,
  initialPrompts,
  initialChannels,
  initialTickets,
  initialLogs,
} from "@/lib/store"
import type {
  User,
  BotConfig,
  BotTicket,
  JiraProject,
  AIProvider,
  SystemPrompt,
  ChannelConfig,
  LogEntry,
} from "@/lib/types"
import { ADMIN_PERMISSIONS, DEFAULT_USER_PERMISSIONS } from "@/lib/types"

// In-memory database singleton.
// In production this would be backed by a real database; here we
// seed from the mock data defined in lib/store.ts and keep state
// across requests in the Node process.

class Database {
  users: User[] = [
    {
      id: "user-1",
      name: "Sarah Chen",
      email: "sarah.chen@jiraclaw.ai",
      role: "admin",
      permissions: ADMIN_PERMISSIONS,
      avatarUrl:
        "https://www.gravatar.com/avatar/6f3b47c0e1e7a5d2f3e2a1b9c8d7e6f5?d=identicon&s=80",
      createdAt: "2025-11-01T08:00:00Z",
    },
    {
      id: "user-2",
      name: "Alex Rivera",
      email: "alex.r@jiraclaw.ai",
      role: "user",
      permissions: {
        ...DEFAULT_USER_PERMISSIONS,
        bots: { view: true, create: true, edit: true, delete: false },
        jira: { view: true, create: true, edit: false, delete: false },
      },
      createdAt: "2026-01-10T14:00:00Z",
    },
    {
      id: "user-3",
      name: "Jordan Kim",
      email: "j.kim@jiraclaw.ai",
      role: "user",
      permissions: DEFAULT_USER_PERMISSIONS,
      createdAt: "2026-02-05T09:30:00Z",
    },
  ]
  bots: BotConfig[] = [...initialBots]
  tickets: BotTicket[] = [...initialTickets]
  jiraProjects: JiraProject[] = [...initialJiraProjects]
  providers: AIProvider[] = [...initialProviders]
  prompts: SystemPrompt[] = [...initialPrompts]
  channels: ChannelConfig[] = [...initialChannels]
  logs: LogEntry[] = [...initialLogs]
}

// Ensure a single instance survives HMR in development
const globalForDb = globalThis as unknown as { __db?: Database }
export const db = globalForDb.__db ?? new Database()
globalForDb.__db = db
