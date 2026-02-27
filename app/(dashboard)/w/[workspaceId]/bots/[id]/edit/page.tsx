"use client";

import { use } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { BotForm } from "@/components/bots/bot-form";
import { BotDetailSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import type { BotConfig, AIProvider, SystemPrompt } from "@/lib/types";

export default function EditBotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const urlParams = useParams();
  const router = useRouter();
  const workspaceId = urlParams.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);

  const { data: bot, isLoading } = useSWR<BotConfig>(
    workspaceId ? `/api/w/${workspaceId}/bots/${id}` : null,
    fetcher,
  );
  const { data: providers = [] } = useSWR<AIProvider[]>(
    workspaceId ? `/api/w/${workspaceId}/ai-models` : null,
    fetcher,
  );
  const { data: prompts = [] } = useSWR<SystemPrompt[]>(
    workspaceId ? `/api/w/${workspaceId}/prompts` : null,
    fetcher,
  );

  const handleSave = async (data: Omit<BotConfig, "id" | "createdAt" | "status">) => {
    await apiForWorkspace.bots.update(id, data as unknown as Record<string, unknown>);
    router.push(`/w/${workspaceId}/bots/${id}`);
  };

  if (isLoading || !bot) return <BotDetailSkeleton />;

  return <BotForm bot={bot} providers={providers} prompts={prompts} onSave={handleSave} />;
}
