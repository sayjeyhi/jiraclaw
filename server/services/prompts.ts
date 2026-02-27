import { Elysia, t } from "elysia";
import { prisma } from "../db";

const promptBody = t.Object({
  name: t.String(),
  content: t.String(),
  isGlobal: t.Boolean(),
  botOverrides: t.Optional(t.Record(t.String(), t.String())),
});

export const promptsService = new Elysia({ prefix: "/prompts", aot: false })
  .get("/", async ({ params }) =>
    prisma.systemPrompt.findMany({ where: { workspaceId: params.workspaceId } }),
  )
  .get("/:id", async ({ params }) => {
    const p = await prisma.systemPrompt.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!p) throw new Error("Prompt not found");
    return p;
  })
  .post(
    "/",
    async ({ params, body }) => {
      const prompt = await prisma.systemPrompt.create({
        data: {
          id: `prompt-${Date.now()}`,
          workspaceId: params.workspaceId,
          ...body,
          botOverrides: (body.botOverrides ?? {}) as object,
        },
      });
      return prompt;
    },
    { body: promptBody },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const existing = await prisma.systemPrompt.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Prompt not found");
      const prompt = await prisma.systemPrompt.update({
        where: { id: params.id },
        data: {
          ...body,
          botOverrides: body.botOverrides as object | undefined,
        },
      });
      return prompt;
    },
    { body: t.Partial(promptBody) },
  )
  .delete("/:id", async ({ params }) => {
    const existing = await prisma.systemPrompt.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!existing) throw new Error("Prompt not found");
    await prisma.systemPrompt.delete({ where: { id: params.id } });
    return { success: true };
  });
