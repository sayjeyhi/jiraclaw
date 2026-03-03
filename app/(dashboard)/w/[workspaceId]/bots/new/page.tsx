"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { BotForm } from "@/components/bots/bot-form";
import { PageSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import { mergeProvidersWithModels } from "@/lib/merge-ai-providers";
import type { BotConfig, AIProvider, SystemPrompt } from "@/lib/types";

export default function NewBotPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);

  const { data: providersRaw = [], isLoading } = useSWR<AIProvider[]>(
    workspaceId ? `/api/w/${workspaceId}/ai-models` : null,
    fetcher,
  );
  const providers = mergeProvidersWithModels(providersRaw);
  const { data: prompts = [] } = useSWR<SystemPrompt[]>(
    workspaceId ? `/api/w/${workspaceId}/prompts` : null,
    fetcher,
  );

  const handleSave = async (data: Omit<BotConfig, "id" | "createdAt" | "status">) => {
    const created = (await apiForWorkspace.bots.create(
      data as unknown as Record<string, unknown>,
    )) as BotConfig;
    router.push(`/w/${workspaceId}/bots/${created.id}`);
  };

  if (isLoading) return <PageSkeleton />;

  return <BotForm bot={null} providers={providers} prompts={prompts} onSave={handleSave} />;
}
