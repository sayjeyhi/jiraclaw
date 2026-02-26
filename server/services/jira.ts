import { Elysia, t } from "elysia";
import { db } from "../db";

const repoSchema = t.Object({
  id: t.String(),
  name: t.String(),
  url: t.String(),
  branch: t.String(),
  label: t.String(),
  status: t.Union([t.Literal("cloned"), t.Literal("cloning"), t.Literal("error")]),
  lastSync: t.Optional(t.String()),
});

const labelMappingSchema = t.Object({
  label: t.String(),
  repositoryId: t.String(),
});

const projectBody = t.Object({
  name: t.String(),
  key: t.String(),
  url: t.String(),
  apiKey: t.Optional(t.String()),
  repositories: t.Array(repoSchema),
  labelMappings: t.Array(labelMappingSchema),
  botId: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("connected"), t.Literal("syncing"), t.Literal("error")])),
});

export const jiraService = new Elysia({ prefix: "/jira", aot: false })
  .get("/", () => db.jiraProjects)
  .get("/:id", ({ params }) => {
    const proj = db.jiraProjects.find((p) => p.id === params.id);
    if (!proj) throw new Error("Project not found");
    return proj;
  })
  .post(
    "/",
    ({ body }) => {
      const project = {
        ...body,
        id: `proj-${Date.now()}`,
        status: body.status ?? ("connected" as const),
      };
      db.jiraProjects.push(project);
      return project;
    },
    { body: projectBody },
  )
  .put(
    "/:id",
    ({ params, body }) => {
      const idx = db.jiraProjects.findIndex((p) => p.id === params.id);
      if (idx === -1) throw new Error("Project not found");
      db.jiraProjects[idx] = { ...db.jiraProjects[idx], ...body };
      return db.jiraProjects[idx];
    },
    { body: t.Partial(projectBody) },
  )
  .delete("/:id", ({ params }) => {
    const idx = db.jiraProjects.findIndex((p) => p.id === params.id);
    if (idx === -1) throw new Error("Project not found");
    db.jiraProjects.splice(idx, 1);
    return { success: true };
  });
