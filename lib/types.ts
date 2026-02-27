export type UserRole = "admin" | "user";

export type ServiceAction =
  | "bots.view"
  | "bots.create"
  | "bots.edit"
  | "bots.delete"
  | "jira.view"
  | "jira.create"
  | "jira.edit"
  | "jira.delete"
  | "ai_models.view"
  | "ai_models.edit"
  | "prompts.view"
  | "prompts.create"
  | "prompts.edit"
  | "prompts.delete"
  | "channels.view"
  | "channels.edit"
  | "logs.view";

export interface UserPermissions {
  bots: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  jira: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  ai_models: { view: boolean; edit: boolean };
  prompts: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  channels: { view: boolean; edit: boolean };
  logs: { view: boolean };
}

export const ADMIN_PERMISSIONS: UserPermissions = {
  bots: { view: true, create: true, edit: true, delete: true },
  jira: { view: true, create: true, edit: true, delete: true },
  ai_models: { view: true, edit: true },
  prompts: { view: true, create: true, edit: true, delete: true },
  channels: { view: true, edit: true },
  logs: { view: true },
};

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  bots: { view: true, create: false, edit: false, delete: false },
  jira: { view: true, create: false, edit: false, delete: false },
  ai_models: { view: true, edit: false },
  prompts: { view: true, create: false, edit: false, delete: false },
  channels: { view: true, edit: false },
  logs: { view: true },
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  avatarUrl?: string;
  createdAt: string;
}

export interface SupervisedSettings {
  confirmSolutionBeforeStart: boolean;
  allowPrCreation: boolean;
  allowPush: boolean;
  allowJiraComment: boolean;
  allowIssueTransition: boolean;
}

export interface BotConfig {
  id: string;
  workspaceId: string;
  title: string;
  email: string;
  botSkillDescription: string;
  status: "active" | "idle" | "working" | "error";
  defaultProvider?: string;
  defaultModel?: string;
  githubToken?: string;
  spendingLimit?: number;
  autonomyLevel: "autonomous" | "supervised";
  supervisedSettings: SupervisedSettings;
  systemPromptId?: string;
  enabledChannels: string[];
  createdAt: string;
}

export interface JiraProject {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  url: string;
  apiKey?: string;
  repositories: Repository[];
  labelMappings: LabelMapping[];
  botId?: string;
  status: "connected" | "syncing" | "error";
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  label: string;
  status: "cloned" | "cloning" | "error";
  lastSync?: string;
}

export interface LabelMapping {
  label: string;
  repositoryId: string;
}

export interface AIProvider {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  apiKey?: string;
  enabled: boolean;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
}

export interface SystemPrompt {
  id: string;
  workspaceId: string;
  name: string;
  content: string;
  isGlobal: boolean;
  botOverrides: Record<string, string>;
  updatedAt: string;
  createdAt: string;
}

export interface ChannelConfig {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  icon: string;
  enabled: boolean;
  credentials: Record<string, string>;
  botOverrides: Record<string, { enabled: boolean; credentials: Record<string, string> }>;
}

export interface BotTicket {
  id: string;
  workspaceId: string;
  key: string;
  summary: string;
  status: "open" | "in_progress" | "in_review" | "done" | "failed";
  priority: "critical" | "high" | "medium" | "low";
  botId: string;
  assignedAt: string;
  completedAt?: string;
  branch?: string;
  repoName?: string;
  channelMessages: ChannelMessage[];
  actions: TicketAction[];
}

export interface ChannelMessage {
  id: string;
  channel: string;
  message: string;
  sentAt: string;
  status: "delivered" | "failed" | "pending";
}

export interface TicketAction {
  id: string;
  type:
    | "branch_created"
    | "pr_opened"
    | "comment_added"
    | "status_changed"
    | "message_sent"
    | "review_submitted"
    | "merged";
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type LogLevel = "info" | "warning" | "error" | "debug";
export type LogService = "jira" | "git" | "ai" | "channels";

export interface LogEntry {
  id: string;
  workspaceId: string;
  service: LogService;
  level: LogLevel;
  message: string;
  timestamp: string;
  botId?: string;
  projectId?: string;
  repoName?: string;
  metadata?: Record<string, unknown>;
}
