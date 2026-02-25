import { Elysia, t } from "elysia"
import { db } from "../db"

const promptBody = t.Object({
  name: t.String(),
  content: t.String(),
  isGlobal: t.Boolean(),
  botOverrides: t.Optional(t.Record(t.String(), t.String())),
})

export const promptsService = new Elysia({ prefix: "/prompts", aot: false })
  .get("/", () => db.prompts)
  .get("/:id", ({ params }) => {
    const p = db.prompts.find((p) => p.id === params.id)
    if (!p) throw new Error("Prompt not found")
    return p
  })
  .post(
    "/",
    ({ body }) => {
      const now = new Date().toISOString()
      const prompt = {
        ...body,
        id: `prompt-${Date.now()}`,
        botOverrides: body.botOverrides ?? {},
        updatedAt: now,
        createdAt: now,
      }
      db.prompts.push(prompt)
      return prompt
    },
    { body: promptBody }
  )
  .put(
    "/:id",
    ({ params, body }) => {
      const idx = db.prompts.findIndex((p) => p.id === params.id)
      if (idx === -1) throw new Error("Prompt not found")
      db.prompts[idx] = {
        ...db.prompts[idx],
        ...body,
        updatedAt: new Date().toISOString(),
      }
      return db.prompts[idx]
    },
    { body: t.Partial(promptBody) }
  )
  .delete("/:id", ({ params }) => {
    const idx = db.prompts.findIndex((p) => p.id === params.id)
    if (idx === -1) throw new Error("Prompt not found")
    db.prompts.splice(idx, 1)
    return { success: true }
  })
