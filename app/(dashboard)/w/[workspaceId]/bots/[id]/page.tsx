"use client";

import { use } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { BotDetailSkeleton } from "@/components/loading-skeletons";
import { BotDetailHeader } from "@/components/bots/bot-detail-header";
import { BotDetailSkills } from "@/components/bots/bot-detail-skills";
import { BotDetailStats } from "@/components/bots/bot-detail-stats";
import { BotDetailSummary } from "@/components/bots/bot-detail-summary";
import { BotTicketsList } from "@/components/bots/bot-tickets-list";
import { fetcher } from "@/lib/api";
import type { BotConfig, BotTicket } from "@/lib/types";

export default function BotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const urlParams = useParams();
  const workspaceId = urlParams.workspaceId as string;
  const searchParams = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticket");

  const { data: bot } = useSWR<BotConfig>(
    workspaceId ? `/api/w/${workspaceId}/bots/${id}` : null,
    fetcher,
  );
  const { data: tickets = [] } = useSWR<BotTicket[]>(
    workspaceId ? `/api/w/${workspaceId}/bots/${id}/tickets` : null,
    fetcher,
  );

  if (!bot) {
    return <BotDetailSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <BotDetailHeader bot={bot} workspaceId={workspaceId} />
      <BotDetailStats bot={bot} />
      <BotDetailSummary tickets={tickets} />
      <BotTicketsList tickets={tickets} expandedTicketId={ticketIdFromUrl} />
      <BotDetailSkills bot={bot} workspaceId={workspaceId} />
    </div>
  );
}
