import { Elysia, t } from "elysia";
import { prisma } from "../db";

export const aiModelsService = new Elysia({ prefix: "/ai-models", aot: false })
  .get("/", async ({ params }) =>
    prisma.aIProvider.findMany({ where: { workspaceId: params.workspaceId } }),
  )
  .post(
    "/",
    async ({ params, body }) => {
      const workspaceId = params.workspaceId;
      const existing = await prisma.aIProvider.findFirst({
        where: { workspaceId, slug: body.slug },
      });
      const providerId = existing?.id ?? `${workspaceId}-${body.slug}`;
      const p = await prisma.aIProvider.upsert({
        where: { id: providerId },
        update: {
          apiKey: body.apiKey ?? existing?.apiKey ?? null,
          enabled: body.enabled ?? existing?.enabled ?? true,
          models: (body.models as object) ?? existing?.models ?? [],
        },
        create: {
          id: providerId,
          workspaceId,
          name: body.name,
          slug: body.slug,
          apiKey: body.apiKey ?? null,
          enabled: body.enabled ?? true,
          models: (body.models as object) ?? [],
        },
      });
      return p;
    },
    {
      body: t.Object({
        id: t.Optional(t.String()),
        name: t.String(),
        slug: t.String(),
        apiKey: t.Optional(t.String()),
        enabled: t.Optional(t.Boolean()),
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
