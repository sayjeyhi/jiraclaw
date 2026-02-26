import { Elysia, t } from "elysia";
import { db } from "../db";

export const aiModelsService = new Elysia({ prefix: "/ai-models", aot: false })
  .get("/", () => db.providers)
  .get("/:id", ({ params }) => {
    const p = db.providers.find((p) => p.id === params.id);
    if (!p) throw new Error("Provider not found");
    return p;
  })
  .put(
    "/:id",
    ({ params, body }) => {
      const idx = db.providers.findIndex((p) => p.id === params.id);
      if (idx === -1) throw new Error("Provider not found");
      db.providers[idx] = { ...db.providers[idx], ...body };
      return db.providers[idx];
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
