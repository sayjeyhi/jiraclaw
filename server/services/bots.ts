import { Elysia, t } from "elysia";
import { db } from "../db";

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
  .get("/", () => db.bots)
  .get("/:id", ({ params }) => {
    const bot = db.bots.find((b) => b.id === params.id);
    if (!bot) throw new Error("Bot not found");
    return bot;
  })
  .get("/:id/tickets", ({ params }) => db.tickets.filter((t) => t.botId === params.id))
  .post(
    "/",
    ({ body }) => {
      const bot = {
        ...body,
        id: `bot-${Date.now()}`,
        status: body.status ?? ("idle" as const),
        createdAt: new Date().toISOString(),
      };
      db.bots.push(bot);
      return bot;
    },
    { body: botBody },
  )
  .put(
    "/:id",
    ({ params, body }) => {
      const idx = db.bots.findIndex((b) => b.id === params.id);
      if (idx === -1) throw new Error("Bot not found");
      db.bots[idx] = { ...db.bots[idx], ...body };
      return db.bots[idx];
    },
    { body: t.Partial(botBody) },
  )
  .delete("/:id", ({ params }) => {
    const idx = db.bots.findIndex((b) => b.id === params.id);
    if (idx === -1) throw new Error("Bot not found");
    db.bots.splice(idx, 1);
    return { success: true };
  });
