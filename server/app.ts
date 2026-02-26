import { Elysia } from "elysia";
import { authService } from "./services/auth";
import { botsService } from "./services/bots";
import { jiraService } from "./services/jira";
import { aiModelsService } from "./services/ai-models";
import { promptsService } from "./services/prompts";
import { channelsService } from "./services/channels";
import { logsService } from "./services/logs";

export const app = new Elysia({ prefix: "/api", aot: false })
  .use(authService)
  .use(botsService)
  .use(jiraService)
  .use(aiModelsService)
  .use(promptsService)
  .use(channelsService)
  .use(logsService)
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }));
