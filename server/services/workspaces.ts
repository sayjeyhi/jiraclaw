import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { auth } from "@/lib/auth";

export const workspacesService = new Elysia({ prefix: "/workspaces", aot: false })
  .get("/", async ({ headers }) => {
    const session = await auth.api.getSession({ headers });
    if (!session) return [];
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user.id },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    });
    return memberships.map((m) => m.workspace);
  })
  .get("/:id", async ({ params }) => {
    const ws = await prisma.workspace.findUnique({ where: { id: params.id } });
    if (!ws) throw new Error("Workspace not found");
    return ws;
  })
  .post(
    "/",
    async ({ body, headers }) => {
      const session = await auth.api.getSession({ headers });
      if (!session) throw new Error("Unauthorized");
      const workspaceId = `ws-${Date.now()}`;
      const ws = await prisma.workspace.create({
        data: {
          id: workspaceId,
          name: body.name,
          slug: body.slug,
          members: {
            create: {
              id: `wm-${Date.now()}`,
              userId: session.user.id,
              role: "admin",
            },
          },
        },
      });
      return ws;
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
      }),
    },
  );
