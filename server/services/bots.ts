import { Elysia, t } from "elysia";
import { prisma } from "../db";

const supervisedSettingsSchema = t.Object({
  confirmPrCreation: t.Boolean(),
  confirmPush: t.Boolean(),
  confirmJiraComment: t.Boolean(),
  confirmSolution: t.Boolean(),
});

const botBody = t.Object({
  title: t.String(),
  email: t.String(),
  botSkillDescription: t.String(),
  status: t.Optional(
    t.Union([t.Literal("active"), t.Literal("idle"), t.Literal("working"), t.Literal("error")]),
  ),
  defaultProvider: t.Optional(t.String()),
  defaultModel: t.Optional(t.String()),
  githubToken: t.Optional(t.String()),
  spendingLimit: t.Optional(t.Number()),
  autonomyLevel: t.Union([t.Literal("autonomous"), t.Literal("supervised")]),
  supervisedSettings: supervisedSettingsSchema,
  systemPromptId: t.Optional(t.String()),
  enabledChannels: t.Array(t.String()),
});

export const botsService = new Elysia({ prefix: "/bots", aot: false })
  .get("/", async ({ params }) =>
    prisma.botConfig.findMany({ where: { workspaceId: params.workspaceId } }),
  )
  .get("/:id", async ({ params }) => {
    const bot = await prisma.botConfig.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!bot) throw new Error("Bot not found");
    return bot;
  })
  .get("/:id/tickets", async ({ params }) =>
    prisma.botTicket.findMany({
      where: { botId: params.id, workspaceId: params.workspaceId },
    }),
  )
  .post(
    "/",
    async ({ params, body }) => {
      const bot = await prisma.botConfig.create({
        data: {
          id: `bot-${Date.now()}`,
          workspaceId: params.workspaceId,
          ...body,
          status: body.status ?? "idle",
          supervisedSettings: body.supervisedSettings as object,
        },
      });
      return bot;
    },
    { body: botBody },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const existing = await prisma.botConfig.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Bot not found");
      const bot = await prisma.botConfig.update({
        where: { id: params.id },
        data: {
          ...body,
          supervisedSettings: body.supervisedSettings as object | undefined,
        },
      });
      return bot;
    },
    { body: t.Partial(botBody) },
  )
  .delete("/:id", async ({ params }) => {
    const bot = await prisma.botConfig.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!bot) throw new Error("Bot not found");
    await prisma.botConfig.delete({ where: { id: params.id } });
    return { success: true };
  });
