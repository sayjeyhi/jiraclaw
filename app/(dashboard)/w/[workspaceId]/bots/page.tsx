"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Bot, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { EmptyStatePlaceholder } from "@/components/empty-state-placeholder";
import { BotCard } from "@/components/bots/bot-card";
import { BotDialog } from "@/components/bots/bot-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import type { BotConfig, BotTicket, AIProvider } from "@/lib/types";

export default function BotsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);

  const {
    data: bots,
    isLoading,
    mutate: mutateBots,
  } = useSWR<BotConfig[]>(workspaceId ? `/api/w/${workspaceId}/bots` : null, fetcher);
  const { data: providers = [] } = useSWR<AIProvider[]>(
    workspaceId ? `/api/w/${workspaceId}/ai-models` : null,
    fetcher,
  );
  const { data: allTickets = [] } = useSWR<BotTicket[]>(
    workspaceId && bots && bots.length > 0
      ? bots.map((b) => `/api/w/${workspaceId}/bots/${b.id}/tickets`)
      : null,
    async () => {
      if (!bots) return [];
      const results = await Promise.all(
        bots.map((b) => apiForWorkspace.bots.tickets(b.id) as Promise<BotTicket[]>),
      );
      return results.flat();
    },
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BotConfig | null>(null);

  const hasConfiguredProvider = providers.some((p) => p.enabled);

  const handleCreate = async (data: Omit<BotConfig, "id" | "createdAt" | "status">) => {
    await apiForWorkspace.bots.create(data as unknown as Record<string, unknown>);
    mutateBots();
  };

  const handleEdit = async (data: Omit<BotConfig, "id" | "createdAt" | "status">) => {
    if (!editingBot) return;
    await apiForWorkspace.bots.update(editingBot.id, data as unknown as Record<string, unknown>);
    mutateBots();
    setEditingBot(null);
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bots"
        description="Create and manage AI-powered bots that monitor Jira and interact with repositories."
      >
        <Button
          disabled={!hasConfiguredProvider}
          onClick={() => {
            setEditingBot(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Create Bot
        </Button>
      </PageHeader>

      {!hasConfiguredProvider && (
        <Alert className="border-amber-500/50 bg-amber-50/50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          <TriangleAlert className="size-4" />
          <AlertTitle>No AI provider configured</AlertTitle>
          <AlertDescription className="flex">
            You need at least one enabled AI provider before you can create bots.{" "}
            <a
              href={`/w/${workspaceId}/ai-models`}
              className="font-medium underline underline-offset-2"
            >
              Go to AI Providers
            </a>{" "}
            to configure one.
          </AlertDescription>
        </Alert>
      )}

      {(bots ?? []).length === 0 ? (
        <EmptyStatePlaceholder
          icon={Bot}
          title="No bots yet"
          description={
            hasConfiguredProvider
              ? "Create your first AI-powered bot to monitor Jira and interact with repositories."
              : "Configure an AI provider first, then come back to create your first bot."
          }
          actionLabel={hasConfiguredProvider ? "Create Bot" : "Go to AI Providers"}
          actionHref={hasConfiguredProvider ? undefined : `/w/${workspaceId}/ai-models`}
          onAction={
            hasConfiguredProvider
              ? () => {
                  setEditingBot(null);
                  setDialogOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(bots ?? []).map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              tickets={allTickets.filter((t) => t.botId === bot.id)}
              workspaceId={workspaceId}
              onEdit={(b) => {
                setEditingBot(b);
                setDialogOpen(true);
              }}
              onDelete={(id) => {
                const target = (bots ?? []).find((b) => b.id === id);
                if (target) setDeleteTarget(target);
              }}
            />
          ))}
        </div>
      )}

      <BotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bot={editingBot}
        providers={providers}
        onSave={editingBot ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Bot"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone. All associated tickets and logs will be preserved.`}
        confirmLabel="Delete Bot"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiForWorkspace.bots.delete(deleteTarget.id);
          mutateBots();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
