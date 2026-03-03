"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyStatePlaceholder } from "@/components/empty-state-placeholder";
import { PromptCard } from "@/components/prompts/prompt-card";
import { PromptDialog } from "@/components/prompts/prompt-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import type { BotConfig, SystemPrompt } from "@/lib/types";
import type { PromptSaveData } from "@/components/prompts/prompt-dialog";

export default function SystemPromptsSettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);

  const {
    data: prompts,
    isLoading,
    mutate,
  } = useSWR<SystemPrompt[]>(workspaceId ? `/api/w/${workspaceId}/prompts` : null, fetcher);
  const { data: bots = [], mutate: mutateBots } = useSWR<BotConfig[]>(
    workspaceId ? `/api/w/${workspaceId}/bots` : null,
    fetcher,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SystemPrompt | null>(null);

  const handleCreate = async (data: PromptSaveData) => {
    await apiForWorkspace.prompts.create(data);
    mutate();
    mutateBots();
  };

  const handleEdit = async (data: PromptSaveData) => {
    if (!editingPrompt) return;
    await apiForWorkspace.prompts.update(editingPrompt.id, data);
    mutate();
    mutateBots();
    setEditingPrompt(null);
  };

  if (isLoading) return <PageSkeleton />;

  const allPrompts = prompts ?? [];
  const globalPrompts = allPrompts.filter((p) => p.isGlobal);
  const botPrompts = allPrompts.filter((p) => !p.isGlobal);

  if (allPrompts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-end">
          <Button
            onClick={() => {
              setEditingPrompt(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Create Prompt
          </Button>
        </div>
        <EmptyStatePlaceholder
          icon={FileText}
          title="No prompts yet"
          description="Create your first system prompt to define how your AI bots behave."
          actionLabel="Create Prompt"
          onAction={() => {
            setEditingPrompt(null);
            setDialogOpen(true);
          }}
        />
        <PromptDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          prompt={editingPrompt}
          bots={bots.map((b) => ({ id: b.id, title: b.title, systemPromptId: b.systemPromptId }))}
          onSave={editingPrompt ? handleEdit : handleCreate}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="absolute top-20 right-4 flex items-center justify-end">
        <Button
          onClick={() => {
            setEditingPrompt(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Create Prompt
        </Button>
      </div>

      {globalPrompts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Global Prompts ({globalPrompts.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {globalPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={(p) => {
                  setEditingPrompt(p);
                  setDialogOpen(true);
                }}
                onDelete={(id) => {
                  const target = allPrompts.find((p) => p.id === id);
                  if (target) setDeleteTarget(target);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {botPrompts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Bot-specific Prompts ({botPrompts.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {botPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={(p) => {
                  setEditingPrompt(p);
                  setDialogOpen(true);
                }}
                onDelete={(id) => {
                  const target = allPrompts.find((p) => p.id === id);
                  if (target) setDeleteTarget(target);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prompt={editingPrompt}
        bots={bots.map((b) => ({ id: b.id, title: b.title, systemPromptId: b.systemPromptId }))}
        onSave={editingPrompt ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Prompt"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Bots using this prompt will fall back to their default behavior.`}
        confirmLabel="Delete Prompt"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiForWorkspace.prompts.delete(deleteTarget.id);
          mutate();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
