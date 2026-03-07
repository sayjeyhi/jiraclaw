"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChannelDialog } from "@/components/channels/channel-dialog";
import { iconMap } from "@/components/channels/channel-icons";
import { TerminalIcon } from "lucide-react";
import type { FormState, FieldErrors } from "./types";
import type { ChannelConfig } from "@/lib/types";

type CreateChannelData = {
  name: string;
  slug: string;
  icon: string;
  credentials: Record<string, string>;
};
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const MAX_CHANNELS = 2;

interface StepChannelsProps {
  form: FormState;
  errors: FieldErrors;
  channels: ChannelConfig[];
  workspaceId: string;
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onClearError: (field: string) => void;
  onCreateChannel: (data: CreateChannelData) => Promise<ChannelConfig | void>;
  onChannelsChange: () => void;
}

export function StepChannels({
  form,
  errors,
  channels,
  workspaceId,
  onFormChange,
  onClearError,
  onCreateChannel,
  onChannelsChange,
}: StepChannelsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const selectedIds = form.selectedChannelIds ?? [];

  const toggleChannel = (channelId: string) => {
    onFormChange((prev) => {
      const current = prev.selectedChannelIds ?? [];
      const isSelected = current.includes(channelId);
      if (isSelected) {
        return { ...prev, selectedChannelIds: current.filter((id) => id !== channelId) };
      }
      if (current.length >= MAX_CHANNELS) return prev;
      return { ...prev, selectedChannelIds: [...current, channelId] };
    });
    onClearError("selectedChannelIds");
  };

  const handleAddChannel = async (data: {
    name: string;
    slug: string;
    icon: string;
    credentials: Record<string, string>;
  }) => {
    const created = await onCreateChannel(data);
    onChannelsChange();
    setDialogOpen(false);
    if (created?.id && selectedIds.length < MAX_CHANNELS) {
      onFormChange((prev) => ({
        ...prev,
        selectedChannelIds: [...(prev.selectedChannelIds ?? []), created.id],
      }));
    }
  };

  const existingSlugs = channels.map((c) => c.slug);

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b pb-3">
        <div>
          <h4 className="text-foreground text-base font-medium tracking-wider uppercase">
            Channels ({selectedIds.length}/{MAX_CHANNELS})
          </h4>
          <p className="text-muted-foreground/70 text-xs">
            Select communication channels for this bot, all communication will be routed through
            these channels.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 size-3.5" />
          Add Channel
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium">Channel</div>

        {channels.length === 0 ? (
          <div className="border-border bg-muted/30 rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground text-sm">No channels yet.</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Add a channel to connect this bot with Slack, Telegram, webhooks, and more.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-1.5 size-3.5" />
              Add Channel
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {channels.map((channel) => {
              const Icon = iconMap[channel.icon as keyof typeof iconMap] ?? TerminalIcon;
              const isSelected = selectedIds.includes(channel.id);
              const canSelect = isSelected || selectedIds.length < MAX_CHANNELS;

              return (
                <div
                  key={channel.id}
                  className={cn(
                    "bg-card flex items-center gap-3 rounded-lg border p-4 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5 ring-primary/20 ring-1"
                      : "border-border",
                    canSelect && "hover:bg-muted/50 cursor-pointer",
                    !canSelect && "cursor-not-allowed opacity-60",
                  )}
                  onClick={() => canSelect && toggleChannel(channel.id)}
                  role="button"
                  tabIndex={canSelect ? 0 : -1}
                  onKeyDown={(e) => {
                    if (canSelect && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      toggleChannel(channel.id);
                    }
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={!canSelect}
                    onCheckedChange={() => canSelect && toggleChannel(channel.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  />
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md",
                      isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-card-foreground text-sm font-medium">{channel.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {Object.keys(channel.credentials).length} credential
                      {Object.keys(channel.credentials).length !== 1 ? "s" : ""} configured
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {errors.selectedChannelIds && (
          <p className="text-destructive text-xs">{errors.selectedChannelIds}</p>
        )}
      </div>

      <ChannelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingSlugs={existingSlugs}
        workspaceId={workspaceId}
        onSave={handleAddChannel}
      />
    </>
  );
}
