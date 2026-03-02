"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";

export async function createWorkspace(name: string, slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const count = await prisma.workspaceMember.count({
    where: { userId: session.user.id },
  });

  const WORKSPACE_LIMIT = parseInt(process.env.WORKSPACE_LIMIT + "", 10);
  if (count >= WORKSPACE_LIMIT) {
    throw new Error(`You can have at most ${WORKSPACE_LIMIT} workspaces.`);
  }

  const workspaceId = `ws-${Date.now()}`;

  const workspace = await prisma.workspace.create({
    data: {
      id: workspaceId,
      name,
      slug,
      members: {
        create: {
          id: `wm-${Date.now()}`,
          userId: session.user.id,
          role: "admin",
        },
      },
    },
  });

  return workspace;
}
