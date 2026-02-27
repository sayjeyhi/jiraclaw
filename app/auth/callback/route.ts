import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    redirect("/sign-in");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    orderBy: { joinedAt: "asc" },
    select: { workspaceId: true },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  redirect(`/w/${membership.workspaceId}/bots`);
}
