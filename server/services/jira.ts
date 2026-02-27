import { Elysia, t } from "elysia";
import { prisma } from "../db";

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
  .get("/", async ({ params }) =>
    prisma.jiraProject.findMany({ where: { workspaceId: params.workspaceId } }),
  )
  .get("/:id", async ({ params }) => {
    const proj = await prisma.jiraProject.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!proj) throw new Error("Project not found");
    return proj;
  })
  .post(
    "/",
    async ({ params, body }) => {
      const project = await prisma.jiraProject.create({
        data: {
          id: `proj-${Date.now()}`,
          workspaceId: params.workspaceId,
          ...body,
          status: body.status ?? "connected",
          repositories: body.repositories as object,
          labelMappings: body.labelMappings as object,
        },
      });
      return project;
    },
    { body: projectBody },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const proj = await prisma.jiraProject.findFirst({
        where: { id: params.id, workspaceId: params.workspaceId },
      });
      if (!proj) throw new Error("Project not found");
      const project = await prisma.jiraProject.update({
        where: { id: params.id },
        data: {
          ...body,
          repositories: body.repositories as object | undefined,
          labelMappings: body.labelMappings as object | undefined,
        },
      });
      return project;
    },
    { body: t.Partial(projectBody) },
  )
  .delete("/:id", async ({ params }) => {
    const proj = await prisma.jiraProject.findFirst({
      where: { id: params.id, workspaceId: params.workspaceId },
    });
    if (!proj) throw new Error("Project not found");
    await prisma.jiraProject.delete({ where: { id: params.id } });
    return { success: true };
  });
