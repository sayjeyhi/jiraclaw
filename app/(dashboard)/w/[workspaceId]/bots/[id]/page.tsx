"use client";

import { use } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { BotDetailSkeleton } from "@/components/loading-skeletons";
import { BotDetailHeader } from "@/components/bots/bot-detail-header";
import { BotDetailSkills } from "@/components/bots/bot-detail-skills";
import { BotDetailPrompts } from "@/components/bots/bot-detail-prompts";
import { BotDetailStats } from "@/components/bots/bot-detail-stats";
import { BotDetailSummary } from "@/components/bots/bot-detail-summary";
import { BotDetailRepos } from "@/components/bots/bot-detail-repos";
import { BotTicketsList } from "@/components/bots/bot-tickets-list";
import { fetcher, api } from "@/lib/api";
import type { BotConfig, BotTicket, JiraProject, SystemPrompt } from "@/lib/types";

export default function BotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const urlParams = useParams();
  const workspaceId = urlParams.workspaceId as string;
  const searchParams = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticket");

  const { data: bot, mutate: mutateBot } = useSWR<BotConfig>(
    workspaceId ? `/api/w/${workspaceId}/bots/${id}` : null,
    fetcher,
  );
  const { data: tickets = [] } = useSWR<BotTicket[]>(
    workspaceId ? `/api/w/${workspaceId}/bots/${id}/tickets` : null,
    fetcher,
  );
  const { data: prompts = [] } = useSWR<SystemPrompt[]>(
    workspaceId ? `/api/w/${workspaceId}/prompts` : null,
    fetcher,
  );
  const { data: allProjects = [] } = useSWR<JiraProject[]>(
    workspaceId ? `/api/w/${workspaceId}/jira` : null,
    fetcher,
  );
  const botProjects = allProjects.filter((p) => p.botId === id);

  const handleSkillsSave = async (skills: string[]) => {
    if (!bot) return;
    await api.forWorkspace(workspaceId).bots.updateSkills(id, skills);
    mutateBot();
  };

  if (!bot) {
    return <BotDetailSkeleton />;
  }

  return (
    <div className="flex flex-col gap-2">
      <BotDetailHeader bot={bot} workspaceId={workspaceId} />
      <BotDetailStats bot={bot} />
      <div className="grid gap-2 sm:grid-cols-2">
        <BotDetailSkills bot={bot} onSkillsSave={handleSkillsSave} />
        <BotDetailPrompts bot={bot} prompts={prompts} />
      </div>
      <BotDetailRepos projects={botProjects} />
      <BotDetailSummary tickets={tickets} />
      <BotTicketsList tickets={tickets} expandedTicketId={ticketIdFromUrl} />
    </div>
  );
}
