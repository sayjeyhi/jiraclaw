import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { encrypt } from "@/lib/encrypt";
import { maskApiKey } from "@/lib/api-key-mask";

const MAX_SKILLS = 10;

type BotRow = {
  encryptedGithubToken: string | null;
  maskedGithubToken: string | null;
} & Record<string, unknown>;

function toPublicBot(raw: BotRow) {
  const masked = raw.maskedGithubToken ?? null;
  const { encryptedGithubToken: _enc, maskedGithubToken: _masked, ...rest } = raw;
  return { ...rest, githubToken: masked };
}
// skills.sh format: owner/repo/skill-name
const SKILL_ID_REGEX = /^[^/]+\/[^/]+\/[^/]+$/;

function normalizeSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  return skills
    .filter((s): s is string => typeof s === "string")
    .filter((id) => SKILL_ID_REGEX.test(id))
    .slice(0, MAX_SKILLS);
}

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
  jiraProjectId: t.Optional(t.String()),
});

export const botsService = new Elysia({ prefix: "/bots", aot: false })
  .get("/", async ({ params }) => {
    const rows = await prisma.botConfig.findMany({
      where: { workspaceId: params.workspaceId },
    });
    return rows.map((r) => toPublicBot(r as BotRow));
  })
  .get("/:id", async ({ params }) => {
    const bot = await prisma.botConfig.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!bot) throw new Error("Bot not found");
    return toPublicBot(bot as BotRow);
  })
  .get("/:id/tickets", async ({ params }) =>
    prisma.botTicket.findMany({
      where: { botId: params.id, workspaceId: params.workspaceId },
    }),
  )
  .patch(
    "/:id/skills",
    async ({ params, body }) => {
      const existing = await prisma.botConfig.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Bot not found");
      const skills = normalizeSkills(body.skills);
      const botSkillDescription =
        skills.length > 0
          ? `Skills from skills.sh: ${skills.join(", ")}`
          : existing.botSkillDescription;
      const bot = await prisma.botConfig.update({
        where: { id: params.id },
        data: { skills, botSkillDescription },
      });
      return toPublicBot(bot as BotRow);
    },
    { body: t.Object({ skills: t.Array(t.String()) }) },
  )
  .post(
    "/",
    async ({ params, body }) => {
      const { jiraProjectId, githubToken: rawToken, ...rest } = body;
      const skills = normalizeSkills(rest.skills ?? []);
      const botSkillDescription = rest.botSkillDescription ?? "";
      const rawKey = rawToken?.trim() || null;
      const encrypted = rawKey ? encrypt(rawKey) : null;
      const masked = rawKey ? maskApiKey(rawKey) : null;
      // Explicit fields only - avoid spreading rest to prevent "Unknown argument" errors from stale Prisma client
      const bot = await prisma.botConfig.create({
        data: {
          id: `bot-${Date.now()}`,
          workspaceId: params.workspaceId,
          title: rest.title,
          email: rest.email,
          botSkillDescription,
          skills,
          status: rest.status ?? "idle",
          defaultProvider: rest.defaultProvider ?? null,
          defaultModel: rest.defaultModel ?? null,
          spendingLimit: rest.spendingLimit ?? null,
          autonomyLevel: rest.autonomyLevel,
          supervisedSettings: rest.supervisedSettings as object,
          systemPromptId: rest.systemPromptId ?? null,
          enabledChannels: rest.enabledChannels ?? [],
          encryptedGithubToken: encrypted,
          maskedGithubToken: masked,
        },
      });
      if (jiraProjectId) {
        const proj = await prisma.jiraProject.findFirst({
          where: { id: jiraProjectId, workspaceId: params.workspaceId },
        });
        if (proj) {
          await prisma.jiraProject.update({
            where: { id: jiraProjectId },
            data: { botId: bot.id },
          });
        }
      }
      return toPublicBot(bot as BotRow);
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
      const { jiraProjectId, githubToken: rawToken, ...rest } = body;
      const skills =
        rest.skills !== undefined ? normalizeSkills(rest.skills) : (existing.skills ?? []);
      const botSkillDescription =
        rest.botSkillDescription !== undefined
          ? rest.botSkillDescription
          : skills.length > 0
            ? `Skills from skills.sh: ${skills.join(", ")}`
            : existing.botSkillDescription;

      // Only pass known BotConfig fields to avoid "column does not exist" errors
      const updateData: Parameters<typeof prisma.botConfig.update>[0]["data"] = {
        title: rest.title,
        email: rest.email,
        skills,
        botSkillDescription,
        autonomyLevel: rest.autonomyLevel,
        supervisedSettings: rest.supervisedSettings as object,
        enabledChannels: rest.enabledChannels ?? existing.enabledChannels,
      };
      if (rest.defaultProvider !== undefined)
        updateData.defaultProvider = rest.defaultProvider || null;
      if (rest.defaultModel !== undefined) updateData.defaultModel = rest.defaultModel || null;
      if (rest.spendingLimit !== undefined) updateData.spendingLimit = rest.spendingLimit ?? null;
      // systemPromptId stores both global and local prompt IDs - always update when provided
      if (rest.systemPromptId !== undefined)
        updateData.systemPromptId = rest.systemPromptId ?? null;
      if (rawToken !== undefined) {
        const rawKey = rawToken?.trim() || null;
        updateData.encryptedGithubToken = rawKey ? encrypt(rawKey) : null;
        updateData.maskedGithubToken = rawKey ? maskApiKey(rawKey) : null;
      }
      const bot = await prisma.botConfig.update({
        where: { id: params.id },
        data: updateData,
      });
      if (jiraProjectId !== undefined) {
        await prisma.jiraProject.updateMany({
          where: { workspaceId: params.workspaceId, botId: params.id },
          data: { botId: null },
        });
        if (jiraProjectId) {
          const proj = await prisma.jiraProject.findFirst({
            where: { id: jiraProjectId, workspaceId: params.workspaceId },
          });
          if (proj) {
            await prisma.jiraProject.update({
              where: { id: jiraProjectId },
              data: { botId: params.id },
            });
          }
        }
      }
      return toPublicBot(bot as BotRow);
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
