import { Elysia, t } from "elysia";
import { prisma } from "../db";

const PermissionsSchema = t.Object({
  bots: t.Object({
    view: t.Boolean(),
    create: t.Boolean(),
    edit: t.Boolean(),
    delete: t.Boolean(),
  }),
  jira: t.Object({
    view: t.Boolean(),
    create: t.Boolean(),
    edit: t.Boolean(),
    delete: t.Boolean(),
  }),
  ai_providers: t.Object({ view: t.Boolean(), edit: t.Boolean() }),
  prompts: t.Object({
    view: t.Boolean(),
    create: t.Boolean(),
    edit: t.Boolean(),
    delete: t.Boolean(),
  }),
  channels: t.Object({ view: t.Boolean(), edit: t.Boolean() }),
  logs: t.Object({ view: t.Boolean() }),
});

export const adminService = new Elysia({ prefix: "/admin", aot: false })
  .get("/users", async () => prisma.user.findMany())
  .post(
    "/users",
    async ({ body }) => {
      const user = await prisma.user.create({
        data: {
          id: `user-${Date.now()}`,
          name: body.name,
          email: body.email,
          role: body.role,
          permissions: body.permissions as object,
          avatarUrl: body.avatarUrl,
          emailVerified: false,
          updatedAt: new Date(),
        },
      });
      return user;
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        role: t.Union([t.Literal("admin"), t.Literal("user")]),
        permissions: PermissionsSchema,
        avatarUrl: t.Optional(t.String()),
      }),
    },
  )
  .put(
    "/users/:id",
    async ({ params, body }) => {
      const user = await prisma.user.update({
        where: { id: params.id },
        data: {
          ...body,
          permissions: body.permissions as object | undefined,
        },
      });
      return user;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String()),
        role: t.Optional(t.Union([t.Literal("admin"), t.Literal("user")])),
        permissions: t.Optional(PermissionsSchema),
        avatarUrl: t.Optional(t.String()),
      }),
    },
  )
  .delete("/users/:id", async ({ params }) => {
    await prisma.user.delete({ where: { id: params.id } });
    return { success: true };
  });
