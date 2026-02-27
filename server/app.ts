import { Elysia } from "elysia";
import { prisma } from "./db";
import { adminService } from "./services/admin";
import { workspacesService } from "./services/workspaces";
import { botsService } from "./services/bots";
import { skillsService } from "./services/skills";
import { jiraService } from "./services/jira";
import { aiModelsService } from "./services/ai-models";
import { promptsService } from "./services/prompts";
import { channelsService } from "./services/channels";
import { logsService } from "./services/logs";

export const app = new Elysia({ prefix: "/api", aot: false })
  .use(adminService)
  .use(workspacesService)
  .use(skillsService)
  .group("/w/:workspaceId", (app) =>
    app
      .derive(async ({ params }) => {
        const workspace = await prisma.workspace.findUnique({
          where: { id: params.workspaceId },
        });
        if (!workspace) throw new Error("Workspace not found");
        return { workspace };
      })
      .use(botsService)
      .use(jiraService)
      .use(aiModelsService)
      .use(promptsService)
      .use(channelsService)
      .use(logsService),
  )
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }));
