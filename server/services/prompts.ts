import { Elysia, t } from "elysia";
import { prisma } from "../db";

const promptBody = t.Object({
  name: t.String(),
  content: t.String(),
  isGlobal: t.Boolean(),
  botOverrides: t.Optional(t.Record(t.String(), t.String())),
  botIds: t.Optional(t.Array(t.String())),
});

const paramsBody = t.Object({
  workspaceId: t.String(),
  id: t.Optional(t.String()),
});

const paramsType = {
  params: paramsBody,
};

export const promptsService = new Elysia({ prefix: "/prompts", aot: false })
  .get(
    "/",
    async ({ params }) =>
      prisma.systemPrompt.findMany({ where: { workspaceId: params.workspaceId } }),
    paramsType,
  )
  .get(
    "/:id",
    async ({ params }) => {
      const p = await prisma.systemPrompt.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!p) throw new Error("Prompt not found");
      return p;
    },
    paramsType,
  )
  .post(
    "/",
    async ({ params, body }) => {
      const { botIds, ...rest } = body;
      const prompt = await prisma.systemPrompt.create({
        data: {
          id: `prompt-${Date.now()}`,
          workspaceId: params.workspaceId,
          ...rest,
          botOverrides: (body.botOverrides ?? {}) as object,
        },
      });
      if (!rest.isGlobal && Array.isArray(botIds) && botIds.length > 0) {
        await prisma.botConfig.updateMany({
          where: {
            workspaceId: params.workspaceId,
            id: { in: botIds },
          },
          data: { systemPromptId: prompt.id },
        });
      }
      return prompt;
    },
    { body: promptBody, params: paramsBody },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const existing = await prisma.systemPrompt.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Prompt not found");
      const { botIds, ...rest } = body;
      const prompt = await prisma.systemPrompt.update({
        where: { id: params.id },
        data: {
          ...rest,
          botOverrides: body.botOverrides as object | undefined,
        },
      });
      if (rest.isGlobal === false) {
        // Clear from bots that were using this prompt but are no longer selected
        await prisma.botConfig.updateMany({
          where: {
            workspaceId: params.workspaceId,
            systemPromptId: params.id,
            id: { notIn: Array.isArray(botIds) ? botIds : [] },
          },
          data: { systemPromptId: null },
        });
        // Assign to selected bots
        if (Array.isArray(botIds) && botIds.length > 0) {
          await prisma.botConfig.updateMany({
            where: {
              workspaceId: params.workspaceId,
              id: { in: botIds },
            },
            data: { systemPromptId: params.id },
          });
        }
      } else if (rest.isGlobal === true) {
        // Switching to global: clear from all bots that were using this prompt (local)
        await prisma.botConfig.updateMany({
          where: { workspaceId: params.workspaceId, systemPromptId: params.id },
          data: { systemPromptId: null },
        });
      }
      // When switching to local: clear globalPromptId from bots that had this as global
      if (rest.isGlobal === false) {
        await prisma.botConfig.updateMany({
          where: { workspaceId: params.workspaceId, globalPromptId: params.id },
          data: { globalPromptId: null },
        });
      }
      return prompt;
    },
    { body: t.Partial(promptBody), params: paramsBody },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      const existing = await prisma.systemPrompt.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Prompt not found");
      // Clear references from bots before deleting
      await prisma.botConfig.updateMany({
        where: { workspaceId: params.workspaceId, globalPromptId: params.id },
        data: { globalPromptId: null },
      });
      await prisma.botConfig.updateMany({
        where: { workspaceId: params.workspaceId, systemPromptId: params.id },
        data: { systemPromptId: null },
      });
      await prisma.systemPrompt.delete({ where: { id: params.id } });
      return { success: true };
    },
    paramsType,
  );
