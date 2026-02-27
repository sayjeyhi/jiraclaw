import { Elysia, t } from "elysia";
import { prisma } from "../db";

export const aiModelsService = new Elysia({ prefix: "/ai-models", aot: false })
  .get("/", async ({ params }) =>
    prisma.aIProvider.findMany({ where: { workspaceId: params.workspaceId } }),
  )
  .get("/:id", async ({ params }) => {
    const p = await prisma.aIProvider.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!p) throw new Error("Provider not found");
    return p;
  })
  .put(
    "/:id",
    async ({ params, body }) => {
      const existing = await prisma.aIProvider.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Provider not found");
      const p = await prisma.aIProvider.update({
        where: { id: params.id },
        data: {
          ...body,
          models: body.models as object | undefined,
        },
      });
      return p;
    },
    {
      body: t.Object({
        enabled: t.Optional(t.Boolean()),
        apiKey: t.Optional(t.String()),
        models: t.Optional(
          t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              maxTokens: t.Number(),
            }),
          ),
        ),
      }),
    },
  );
