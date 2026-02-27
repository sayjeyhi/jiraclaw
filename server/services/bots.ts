import { Elysia, t } from "elysia";
import { prisma } from "../db";

const supervisedSettingsSchema = t.Object({
  confirmSolutionBeforeStart: t.Boolean(),
  allowPrCreation: t.Boolean(),
  allowPush: t.Boolean(),
  allowJiraComment: t.Boolean(),
  allowIssueTransition: t.Boolean(),
});

const botBody = t.Object({
  title: t.String(),
  email: t.String(),
  botSkillDescription: t.Optional(t.String()),
  skills: t.Optional(t.Array(t.String())),
  status: t.Optional(
    t.Union([t.Literal("active"), t.Literal("idle"), t.Literal("working"), t.Literal("error")]),
  ),
  defaultProvider: t.Optional(t.String()),
  defaultModel: t.Optional(t.String()),
  githubToken: t.Optional(t.String()),
  spendingLimit: t.Optional(t.Number()),
  autonomyLevel: t.Union([t.Literal("autonomous"), t.Literal("supervised")]),
  supervisedSettings: supervisedSettingsSchema,
  systemPromptId: t.Optional(t.Union([t.String(), t.Null()])),
  enabledChannels: t.Array(t.String()),
  workspaceId: t.String(),
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
      const skills = body.skills ?? [];
      const botSkillDescription =
        body.botSkillDescription ??
        (skills.length > 0 ? `Skills from skills.sh: ${skills.join(", ")}` : "");
      const bot = await prisma.botConfig.create({
        data: {
          id: `bot-${Date.now()}`,
          workspaceId: params.workspaceId,
          ...body,
          botSkillDescription,
          skills,
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
      const skills = body.skills ?? existing.skills ?? [];
      const botSkillDescription =
        body.botSkillDescription ??
        (skills.length > 0
          ? `Skills from skills.sh: ${skills.join(", ")}`
          : existing.botSkillDescription);
      const updateData: Record<string, unknown> = {
        ...body,
        skills,
        botSkillDescription,
        supervisedSettings: body.supervisedSettings as object | undefined,
      };
      if (body.systemPromptId !== undefined) {
        updateData.systemPromptId = body.systemPromptId ?? null;
      }
      const bot = await prisma.botConfig.update({
        where: { id: params.id },
        data: updateData,
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
