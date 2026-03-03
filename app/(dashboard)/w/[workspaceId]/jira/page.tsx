import { redirect } from "next/navigation";

export default async function JiraRedirectPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  redirect(`/w/${workspaceId}/settings/ticket-integration`);
}
