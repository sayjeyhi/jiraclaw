import { redirect } from "next/navigation";

export default async function PromptsRedirectPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  redirect(`/w/${workspaceId}/settings/system-prompts`);
}
