import { Elysia, t } from "elysia"
import { db } from "../db"

export const channelsService = new Elysia({ prefix: "/channels", aot: false })
  .get("/", () => db.channels)
  .get("/:id", ({ params }) => {
    const c = db.channels.find((c) => c.id === params.id)
    if (!c) throw new Error("Channel not found")
    return c
  })
  .put(
    "/:id",
    ({ params, body }) => {
      const idx = db.channels.findIndex((c) => c.id === params.id)
      if (idx === -1) throw new Error("Channel not found")
      db.channels[idx] = { ...db.channels[idx], ...body }
      return db.channels[idx]
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
            })
          )
        ),
      }),
    }
  )
