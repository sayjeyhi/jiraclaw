import { Elysia, t } from "elysia"
import { db } from "../db"

const PermissionsSchema = t.Object({
  bots: t.Object({ view: t.Boolean(), create: t.Boolean(), edit: t.Boolean(), delete: t.Boolean() }),
  jira: t.Object({ view: t.Boolean(), create: t.Boolean(), edit: t.Boolean(), delete: t.Boolean() }),
  ai_models: t.Object({ view: t.Boolean(), edit: t.Boolean() }),
  prompts: t.Object({ view: t.Boolean(), create: t.Boolean(), edit: t.Boolean(), delete: t.Boolean() }),
  channels: t.Object({ view: t.Boolean(), edit: t.Boolean() }),
  logs: t.Object({ view: t.Boolean() }),
})

export const authService = new Elysia({ prefix: "/auth", aot: false })
  .get("/me", () => {
    return db.users[0] ?? null
  })
  .get("/users", () => db.users)
  .post(
    "/users",
    ({ body }) => {
      const user = {
        ...body,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
      return user
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        role: t.Union([t.Literal("admin"), t.Literal("user")]),
        permissions: PermissionsSchema,
        avatarUrl: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/users/:id",
    ({ params, body }) => {
      const idx = db.users.findIndex((u) => u.id === params.id)
      if (idx === -1) throw new Error("User not found")
      db.users[idx] = { ...db.users[idx], ...body }
      return db.users[idx]
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String()),
        role: t.Optional(t.Union([t.Literal("admin"), t.Literal("user")])),
        permissions: t.Optional(PermissionsSchema),
        avatarUrl: t.Optional(t.String()),
      }),
    }
  )
  .delete("/users/:id", ({ params }) => {
    const idx = db.users.findIndex((u) => u.id === params.id)
    if (idx === -1) throw new Error("User not found")
    db.users.splice(idx, 1)
    return { success: true }
  })
