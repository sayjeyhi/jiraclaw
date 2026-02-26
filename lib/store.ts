import type {
  BotConfig,
  BotTicket,
  JiraProject,
  AIProvider,
  SystemPrompt,
  ChannelConfig,
  LogEntry,
} from "./types";

export const initialBots: BotConfig[] = [
  {
    id: "bot-2",
    title: "Issue Triager",
    email: "triage@jiraclaw.ai",
    botSkillDescription:
      "Monitors incoming Jira issues, categorizes them by priority and component, and assigns them to the appropriate team members.",
    status: "idle",
    defaultProvider: "anthropic",
    defaultModel: "claude-sonnet-4",
    githubToken: "ghp_****triager",
    spendingLimit: 50,
    autonomyLevel: "autonomous",
    supervisedSettings: {
      confirmPrCreation: false,
      confirmPush: false,
      confirmJiraComment: false,
      confirmSolution: false,
    },
    systemPromptId: "prompt-2",
    enabledChannels: ["discord", "webhook"],
    createdAt: "2026-02-01T14:00:00Z",
  },
  {
    id: "bot-3",
    title: "Sprint Reporter",
    email: "sprint@jiraclaw.ai",
    botSkillDescription:
      "Generates automated sprint reports, burndown summaries, and velocity metrics at the end of each sprint cycle.",
    status: "error",
    defaultProvider: "openrouter",
    spendingLimit: 25,
    autonomyLevel: "autonomous",
    supervisedSettings: {
      confirmPrCreation: false,
      confirmPush: false,
      confirmJiraComment: false,
      confirmSolution: false,
    },
    enabledChannels: ["slack"],
    createdAt: "2026-02-10T09:15:00Z",
  },
];

export const initialJiraProjects: JiraProject[] = [
  {
    id: "proj-1",
    name: "Platform Core",
    key: "PLAT",
    url: "https://team.atlassian.net/browse/PLAT",
    repositories: [
      {
        id: "repo-1",
        name: "platform-api",
        url: "https://github.com/team/platform-api",
        branch: "main",
        label: "backend",
        status: "cloned",
        lastSync: "2026-02-24T18:00:00Z",
      },
      {
        id: "repo-2",
        name: "platform-web",
        url: "https://github.com/team/platform-web",
        branch: "main",
        label: "frontend",
        status: "cloned",
        lastSync: "2026-02-24T17:45:00Z",
      },
    ],
    labelMappings: [
      { label: "backend", repositoryId: "repo-1" },
      { label: "frontend", repositoryId: "repo-2" },
    ],
    botId: "bot-1",
    status: "connected",
  },
  {
    id: "proj-2",
    name: "Mobile App",
    key: "MOB",
    url: "https://team.atlassian.net/browse/MOB",
    repositories: [
      {
        id: "repo-3",
        name: "mobile-app",
        url: "https://github.com/team/mobile-app",
        branch: "develop",
        label: "any",
        status: "cloning",
      },
    ],
    labelMappings: [],
    botId: "bot-2",
    status: "syncing",
  },
];

export const initialProviders: AIProvider[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    slug: "openrouter",
    apiKey: "sk-or-****",
    enabled: true,
    models: [
      { id: "openrouter/auto", name: "Auto", maxTokens: 128000 },
      { id: "openrouter/google/gemini-pro", name: "Gemini Pro", maxTokens: 32000 },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    slug: "anthropic",
    apiKey: "sk-ant-****",
    enabled: true,
    models: [
      { id: "claude-sonnet-4", name: "Claude Sonnet 4", maxTokens: 200000 },
      { id: "claude-haiku-3.5", name: "Claude Haiku 3.5", maxTokens: 200000 },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    slug: "openai",
    apiKey: "sk-****",
    enabled: true,
    models: [
      { id: "gpt-4o", name: "GPT-4o", maxTokens: 128000 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", maxTokens: 128000 },
      { id: "o1", name: "o1", maxTokens: 200000 },
    ],
  },
  {
    id: "ollama",
    name: "Ollama",
    slug: "ollama",
    enabled: false,
    models: [
      { id: "llama3.2", name: "Llama 3.2", maxTokens: 8192 },
      { id: "mistral", name: "Mistral 7B", maxTokens: 8192 },
    ],
  },
  { id: "venice", name: "Venice", slug: "venice", enabled: false, models: [] },
  {
    id: "groq",
    name: "Groq",
    slug: "groq",
    enabled: false,
    models: [{ id: "llama-3.3-70b", name: "Llama 3.3 70B", maxTokens: 128000 }],
  },
  {
    id: "mistral",
    name: "Mistral",
    slug: "mistral",
    enabled: false,
    models: [{ id: "mistral-large", name: "Mistral Large", maxTokens: 128000 }],
  },
  { id: "xai", name: "xAI", slug: "xai", enabled: false, models: [] },
  {
    id: "deepseek",
    name: "DeepSeek",
    slug: "deepseek",
    enabled: false,
    models: [{ id: "deepseek-chat", name: "DeepSeek Chat", maxTokens: 64000 }],
  },
  { id: "together", name: "Together", slug: "together", enabled: false, models: [] },
  { id: "fireworks", name: "Fireworks", slug: "fireworks", enabled: false, models: [] },
  { id: "perplexity", name: "Perplexity", slug: "perplexity", enabled: false, models: [] },
  { id: "cohere", name: "Cohere", slug: "cohere", enabled: false, models: [] },
  { id: "bedrock", name: "Bedrock", slug: "bedrock", enabled: false, models: [] },
  { id: "google", name: "Google AI", slug: "google", enabled: false, models: [] },
  { id: "azure", name: "Azure OpenAI", slug: "azure", enabled: false, models: [] },
  { id: "replicate", name: "Replicate", slug: "replicate", enabled: false, models: [] },
  { id: "huggingface", name: "Hugging Face", slug: "huggingface", enabled: false, models: [] },
  { id: "ai21", name: "AI21", slug: "ai21", enabled: false, models: [] },
  { id: "deepinfra", name: "Deep Infra", slug: "deepinfra", enabled: false, models: [] },
  { id: "lepton", name: "Lepton", slug: "lepton", enabled: false, models: [] },
  { id: "anyscale", name: "Anyscale", slug: "anyscale", enabled: false, models: [] },
];

export const initialPrompts: SystemPrompt[] = [
  {
    id: "prompt-2",
    name: "Issue Triage Specialist",
    content:
      "You are a Jira issue triage specialist. Analyze incoming issues and categorize them by severity, component, and priority. Suggest appropriate team assignments based on the issue content and historical patterns.",
    isGlobal: false,
    botOverrides: {},
    updatedAt: "2026-02-18T08:00:00Z",
    createdAt: "2026-02-01T14:00:00Z",
  },
  {
    id: "prompt-3",
    name: "Global Base Prompt",
    content:
      "You are a helpful AI assistant integrated into the JiraClaw automation platform. Always provide clear, concise, and actionable responses. Follow the project's coding standards and conventions.",
    isGlobal: true,
    botOverrides: {
      "bot-1": "Focus on code quality and security in all reviews.",
      "bot-3": "Emphasize metrics and data-driven insights in sprint reports.",
    },
    updatedAt: "2026-02-22T16:00:00Z",
    createdAt: "2026-01-10T09:00:00Z",
  },
];

export const initialChannels: ChannelConfig[] = [
  {
    id: "cli",
    name: "CLI",
    slug: "cli",
    icon: "Terminal",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "telegram",
    name: "Telegram",
    slug: "telegram",
    icon: "Send",
    enabled: true,
    credentials: { botToken: "****" },
    botOverrides: {},
  },
  {
    id: "signal",
    name: "Signal",
    slug: "signal",
    icon: "Shield",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "discord",
    name: "Discord",
    slug: "discord",
    icon: "Headphones",
    enabled: true,
    credentials: { botToken: "****", guildId: "****" },
    botOverrides: {},
  },
  {
    id: "slack",
    name: "Slack",
    slug: "slack",
    icon: "Hash",
    enabled: true,
    credentials: { webhookUrl: "****", botToken: "****" },
    botOverrides: {},
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    slug: "whatsapp",
    icon: "MessageCircle",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "line",
    name: "Line",
    slug: "line",
    icon: "MessageSquare",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "lark",
    name: "Lark / Feishu",
    slug: "lark",
    icon: "Feather",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "onebot",
    name: "OneBot",
    slug: "onebot",
    icon: "Bot",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "qq",
    name: "QQ",
    slug: "qq",
    icon: "MessagesSquare",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "matrix",
    name: "Matrix",
    slug: "matrix",
    icon: "Grid3x3",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "irc",
    name: "IRC",
    slug: "irc",
    icon: "Hash",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "imessage",
    name: "iMessage",
    slug: "imessage",
    icon: "Smartphone",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "email",
    name: "Email",
    slug: "email",
    icon: "Mail",
    enabled: true,
    credentials: { smtpHost: "smtp.gmail.com", smtpPort: "587" },
    botOverrides: {},
  },
  {
    id: "dingtalk",
    name: "DingTalk",
    slug: "dingtalk",
    icon: "Bell",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "maixcam",
    name: "MaixCam",
    slug: "maixcam",
    icon: "Camera",
    enabled: false,
    credentials: {},
    botOverrides: {},
  },
  {
    id: "webhook",
    name: "Webhook",
    slug: "webhook",
    icon: "Webhook",
    enabled: true,
    credentials: { url: "https://hooks.example.com/jiraclaw" },
    botOverrides: {},
  },
];

export const initialTickets: BotTicket[] = [
  {
    id: "ticket-1",
    key: "PLAT-1234",
    summary: "Fix authentication bypass in API middleware",
    status: "done",
    priority: "critical",
    botId: "bot-1",
    assignedAt: "2026-02-23T08:00:00Z",
    completedAt: "2026-02-23T14:30:00Z",
    branch: "fix/PLAT-1234-auth-bypass",
    repoName: "platform-api",
    channelMessages: [
      {
        id: "msg-1",
        channel: "slack",
        message: "Picked up PLAT-1234: Fix authentication bypass in API middleware",
        sentAt: "2026-02-23T08:01:00Z",
        status: "delivered",
      },
      {
        id: "msg-2",
        channel: "slack",
        message: "PR #142 opened for PLAT-1234 - ready for review",
        sentAt: "2026-02-23T12:15:00Z",
        status: "delivered",
      },
      {
        id: "msg-3",
        channel: "email",
        message: "Code review completed for PLAT-1234. 2 issues found, 1 critical.",
        sentAt: "2026-02-23T13:00:00Z",
        status: "delivered",
      },
    ],
    actions: [
      {
        id: "act-1",
        type: "status_changed",
        description: "Status changed from Open to In Progress",
        timestamp: "2026-02-23T08:00:00Z",
      },
      {
        id: "act-2",
        type: "branch_created",
        description: "Created branch fix/PLAT-1234-auth-bypass on platform-api",
        timestamp: "2026-02-23T08:02:00Z",
      },
      {
        id: "act-3",
        type: "message_sent",
        description: "Notified #code-reviews on Slack",
        timestamp: "2026-02-23T08:03:00Z",
      },
      {
        id: "act-4",
        type: "review_submitted",
        description: "Code review submitted: found SQL injection vulnerability in auth middleware",
        timestamp: "2026-02-23T12:00:00Z",
      },
      {
        id: "act-5",
        type: "pr_opened",
        description: "PR #142 opened: Fix auth bypass vulnerability",
        timestamp: "2026-02-23T12:15:00Z",
      },
      {
        id: "act-6",
        type: "merged",
        description: "PR #142 merged into main",
        timestamp: "2026-02-23T14:30:00Z",
      },
      {
        id: "act-7",
        type: "status_changed",
        description: "Status changed from In Review to Done",
        timestamp: "2026-02-23T14:30:00Z",
      },
    ],
  },
  {
    id: "ticket-2",
    key: "PLAT-1189",
    summary: "Refactor user service to use repository pattern",
    status: "in_review",
    priority: "medium",
    botId: "bot-1",
    assignedAt: "2026-02-24T09:00:00Z",
    branch: "refactor/PLAT-1189-user-service",
    repoName: "platform-api",
    channelMessages: [
      {
        id: "msg-4",
        channel: "slack",
        message: "Picked up PLAT-1189: Refactor user service",
        sentAt: "2026-02-24T09:01:00Z",
        status: "delivered",
      },
      {
        id: "msg-5",
        channel: "slack",
        message: "PR #148 opened for PLAT-1189",
        sentAt: "2026-02-24T15:00:00Z",
        status: "delivered",
      },
    ],
    actions: [
      {
        id: "act-8",
        type: "status_changed",
        description: "Status changed from Open to In Progress",
        timestamp: "2026-02-24T09:00:00Z",
      },
      {
        id: "act-9",
        type: "branch_created",
        description: "Created branch refactor/PLAT-1189-user-service on platform-api",
        timestamp: "2026-02-24T09:05:00Z",
      },
      {
        id: "act-10",
        type: "review_submitted",
        description: "Reviewed 12 files across 3 modules. Suggested extracting interface.",
        timestamp: "2026-02-24T14:45:00Z",
      },
      {
        id: "act-11",
        type: "pr_opened",
        description: "PR #148 opened: Refactor user service with repository pattern",
        timestamp: "2026-02-24T15:00:00Z",
      },
      {
        id: "act-12",
        type: "status_changed",
        description: "Status changed to In Review",
        timestamp: "2026-02-24T15:01:00Z",
      },
    ],
  },
  {
    id: "ticket-3",
    key: "PLAT-1201",
    summary: "Update dependencies and fix security advisories",
    status: "in_progress",
    priority: "high",
    botId: "bot-1",
    assignedAt: "2026-02-25T07:30:00Z",
    branch: "chore/PLAT-1201-deps-update",
    repoName: "platform-web",
    channelMessages: [
      {
        id: "msg-6",
        channel: "slack",
        message: "Picked up PLAT-1201: Update dependencies and fix security advisories",
        sentAt: "2026-02-25T07:31:00Z",
        status: "delivered",
      },
    ],
    actions: [
      {
        id: "act-13",
        type: "status_changed",
        description: "Status changed from Open to In Progress",
        timestamp: "2026-02-25T07:30:00Z",
      },
      {
        id: "act-14",
        type: "branch_created",
        description: "Created branch chore/PLAT-1201-deps-update on platform-web",
        timestamp: "2026-02-25T07:32:00Z",
      },
      {
        id: "act-15",
        type: "comment_added",
        description: "Added comment: Found 3 critical and 7 moderate advisories",
        timestamp: "2026-02-25T08:00:00Z",
      },
    ],
  },
  {
    id: "ticket-4",
    key: "PLAT-1150",
    summary: "Add rate limiting to public endpoints",
    status: "done",
    priority: "high",
    botId: "bot-1",
    assignedAt: "2026-02-20T10:00:00Z",
    completedAt: "2026-02-21T16:00:00Z",
    branch: "feat/PLAT-1150-rate-limiting",
    repoName: "platform-api",
    channelMessages: [
      {
        id: "msg-7",
        channel: "slack",
        message: "Picked up PLAT-1150: Add rate limiting",
        sentAt: "2026-02-20T10:01:00Z",
        status: "delivered",
      },
      {
        id: "msg-8",
        channel: "email",
        message: "PR #139 merged for PLAT-1150",
        sentAt: "2026-02-21T16:00:00Z",
        status: "delivered",
      },
    ],
    actions: [
      {
        id: "act-16",
        type: "status_changed",
        description: "Status changed to In Progress",
        timestamp: "2026-02-20T10:00:00Z",
      },
      {
        id: "act-17",
        type: "branch_created",
        description: "Created branch feat/PLAT-1150-rate-limiting",
        timestamp: "2026-02-20T10:02:00Z",
      },
      {
        id: "act-18",
        type: "pr_opened",
        description: "PR #139 opened: Implement rate limiting middleware",
        timestamp: "2026-02-21T11:00:00Z",
      },
      {
        id: "act-19",
        type: "merged",
        description: "PR #139 merged into main",
        timestamp: "2026-02-21T16:00:00Z",
      },
      {
        id: "act-20",
        type: "status_changed",
        description: "Status changed to Done",
        timestamp: "2026-02-21T16:00:00Z",
      },
    ],
  },
  {
    id: "ticket-5",
    key: "MOB-567",
    summary: "Triage: App crashes on login with biometric auth",
    status: "done",
    priority: "critical",
    botId: "bot-2",
    assignedAt: "2026-02-22T11:00:00Z",
    completedAt: "2026-02-22T11:15:00Z",
    repoName: "mobile-app",
    channelMessages: [
      {
        id: "msg-9",
        channel: "discord",
        message: "Triaged MOB-567: Critical crash on biometric login. Assigned to @mobile-team.",
        sentAt: "2026-02-22T11:10:00Z",
        status: "delivered",
      },
    ],
    actions: [
      {
        id: "act-21",
        type: "status_changed",
        description: "Categorized as Critical - P0",
        timestamp: "2026-02-22T11:05:00Z",
      },
      {
        id: "act-22",
        type: "comment_added",
        description:
          "Added triage analysis: Crash in BiometricAuth.swift line 142, null pointer on keychain access",
        timestamp: "2026-02-22T11:08:00Z",
      },
      {
        id: "act-23",
        type: "message_sent",
        description: "Notified #mobile-critical on Discord",
        timestamp: "2026-02-22T11:10:00Z",
      },
      {
        id: "act-24",
        type: "status_changed",
        description: "Assigned to mobile-team, status set to Open",
        timestamp: "2026-02-22T11:15:00Z",
      },
    ],
  },
  {
    id: "ticket-6",
    key: "MOB-589",
    summary: "Triage: Push notifications not arriving on Android 15",
    status: "done",
    priority: "high",
    botId: "bot-2",
    assignedAt: "2026-02-24T14:00:00Z",
    completedAt: "2026-02-24T14:20:00Z",
    repoName: "mobile-app",
    channelMessages: [
      {
        id: "msg-10",
        channel: "discord",
        message:
          "Triaged MOB-589: Push notification issue on Android 15. Assigned to @android-team.",
        sentAt: "2026-02-24T14:15:00Z",
        status: "delivered",
      },
      {
        id: "msg-11",
        channel: "webhook",
        message: '{"ticket": "MOB-589", "action": "triaged", "priority": "high"}',
        sentAt: "2026-02-24T14:16:00Z",
        status: "delivered",
      },
    ],
    actions: [
      {
        id: "act-25",
        type: "status_changed",
        description: "Categorized as High - P1",
        timestamp: "2026-02-24T14:05:00Z",
      },
      {
        id: "act-26",
        type: "comment_added",
        description:
          "Added triage analysis: FCM token refresh failing on Android 15 due to new permission model",
        timestamp: "2026-02-24T14:10:00Z",
      },
      {
        id: "act-27",
        type: "message_sent",
        description: "Notified #android-bugs on Discord",
        timestamp: "2026-02-24T14:15:00Z",
      },
    ],
  },
  {
    id: "ticket-7",
    key: "MOB-601",
    summary: "Triage: Memory leak in image gallery component",
    status: "in_progress",
    priority: "medium",
    botId: "bot-2",
    assignedAt: "2026-02-25T09:00:00Z",
    repoName: "mobile-app",
    channelMessages: [
      {
        id: "msg-12",
        channel: "discord",
        message: "Triaging MOB-601: Memory leak reported in image gallery",
        sentAt: "2026-02-25T09:01:00Z",
        status: "delivered",
      },
    ],
    actions: [
      {
        id: "act-28",
        type: "status_changed",
        description: "Starting triage analysis",
        timestamp: "2026-02-25T09:00:00Z",
      },
      {
        id: "act-29",
        type: "comment_added",
        description: "Analyzing heap dumps from crash reports",
        timestamp: "2026-02-25T09:05:00Z",
      },
    ],
  },
  {
    id: "ticket-8",
    key: "PLAT-1100",
    summary: "Sprint 23 velocity and burndown report",
    status: "failed",
    priority: "low",
    botId: "bot-3",
    assignedAt: "2026-02-21T00:00:00Z",
    repoName: "platform-api",
    channelMessages: [
      {
        id: "msg-13",
        channel: "slack",
        message: "Failed to generate Sprint 23 report: OpenRouter API timeout",
        sentAt: "2026-02-21T00:05:00Z",
        status: "failed",
      },
    ],
    actions: [
      {
        id: "act-30",
        type: "status_changed",
        description: "Started generating sprint report",
        timestamp: "2026-02-21T00:00:00Z",
      },
      {
        id: "act-31",
        type: "comment_added",
        description: "Error: OpenRouter API connection timed out after 30s",
        timestamp: "2026-02-21T00:05:00Z",
      },
    ],
  },
];

function generateLogs(): LogEntry[] {
  const services: Array<"jira" | "git" | "ai" | "channels"> = ["jira", "git", "ai", "channels"];
  const levels: Array<"info" | "warning" | "error" | "debug"> = [
    "info",
    "info",
    "info",
    "warning",
    "error",
    "debug",
  ];
  const messages: Record<string, string[]> = {
    jira: [
      "Ticket PLAT-1234 assigned to reviewer@jiraclaw.ai",
      "Monitoring Jira project PLAT for new assignments",
      "Failed to fetch Jira board data: 403 Forbidden",
      "Ticket MOB-567 status changed to In Progress",
      "Webhook received for PLAT-890 comment update",
      "Connection to Jira API re-established",
      "Rate limit approaching: 45/50 requests per minute",
    ],
    git: [
      "Cloning repository platform-api...",
      "Repository platform-web synced successfully",
      "Failed to pull latest changes from mobile-app: merge conflict",
      "Branch main updated with 3 new commits",
      "Git webhook received for push to platform-api",
      "Repository clone completed: platform-api (245MB)",
      "Checking out branch feature/PLAT-1234",
    ],
    ai: [
      "Processing code review for PR #142 using GPT-4o",
      "Token usage: 4,521 input / 1,203 output (GPT-4o)",
      "Model response generated in 3.2s",
      "Fallback to Claude Sonnet 4 after OpenAI timeout",
      "Rate limit exceeded for Anthropic API, queuing request",
      "Embedding generation completed for 45 files",
    ],
    channels: [
      "Slack message sent to #code-reviews",
      "Discord notification delivered to guild 12345",
      "Email sent to team@company.com",
      "Webhook POST to hooks.example.com returned 200",
      "Telegram message delivery failed: bot blocked by user",
      "Slack channel #sprint-reports not found",
      "Webhook retry 2/3 for failed delivery",
    ],
  };

  const entries: LogEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < 120; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const msgs = messages[service];
    const message = msgs[Math.floor(Math.random() * msgs.length)];

    const repoNames = ["platform-api", "platform-web", "mobile-app"];
    entries.push({
      id: `log-${i}`,
      service,
      level,
      message,
      timestamp: new Date(now - i * 60000 * Math.random() * 30).toISOString(),
      botId: Math.random() > 0.3 ? `bot-${Math.floor(Math.random() * 3) + 1}` : undefined,
      repoName:
        service === "git" || service === "jira"
          ? repoNames[Math.floor(Math.random() * repoNames.length)]
          : undefined,
      metadata:
        level === "error"
          ? {
              stack:
                "Error: Connection timeout\n  at fetch (/src/services/jira.ts:45)\n  at monitor (/src/services/jira.ts:102)",
            }
          : undefined,
    });
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const initialLogs: LogEntry[] = generateLogs();
