import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { randomUUID } from "node:crypto";

export const channelsService = new Elysia({ prefix: "/channels", aot: false })
  .get("/", async ({ params }) =>
    prisma.channelConfig.findMany({ where: { workspaceId: params.workspaceId } }),
  )
  .post(
    "/",
    async ({ params, body }) => {
      const existing = await prisma.channelConfig.findFirst({
        where: {
          workspaceId: params.workspaceId,
          slug: body.slug,
        },
      });
      if (existing) throw new Error("Channel already exists for this workspace");
      const c = await prisma.channelConfig.create({
        data: {
          id: randomUUID(),
          workspaceId: params.workspaceId,
          name: body.name,
          slug: body.slug,
          icon: body.icon,
          enabled: true,
          credentials: (body.credentials as object) ?? {},
          botOverrides: {},
        },
      });
      return c;
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        icon: t.String(),
        credentials: t.Optional(t.Record(t.String(), t.String())),
      }),
    },
  )
  .get("/:id", async ({ params }) => {
    const c = await prisma.channelConfig.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!c) throw new Error("Channel not found");
    return c;
  })
  .put(
    "/:id",
    async ({ params, body }) => {
      const existing = await prisma.channelConfig.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!existing) throw new Error("Channel not found");
      const c = await prisma.channelConfig.update({
        where: { id: params.id },
        data: {
          ...body,
          credentials: body.credentials as object | undefined,
          botOverrides: body.botOverrides as object | undefined,
        },
      });
      return c;
    },
    {
      body: t.Object({
        enabled: t.Optional(t.Boolean()),
        credentials: t.Optional(t.Record(t.String(), t.String())),
        botOverrides: t.Optional(
          t.Record(
            t.String(),
            t.Object({
              enabled: t.Boolean(),
              credentials: t.Record(t.String(), t.String()),
            }),
          ),
        ),
      }),
    },
  );
