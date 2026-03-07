"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Plus, Radio, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { EmptyStatePlaceholder } from "@/components/empty-state-placeholder";
import { ChannelCard } from "@/components/channels/channel-card";
import { ChannelDialog } from "@/components/channels/channel-dialog";
import { ProviderListSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import type { ChannelConfig } from "@/lib/types";

export default function ChannelsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);

  const {
    data: channels,
    isLoading,
    mutate,
  } = useSWR<ChannelConfig[]>(workspaceId ? `/api/w/${workspaceId}/channels` : null, fetcher);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggle = async (id: string, enabled: boolean) => {
    await apiForWorkspace.channels.update(id, { enabled });
    mutate();
  };

  const handleUpdateCredentials = async (id: string, credentials: Record<string, string>) => {
    await apiForWorkspace.channels.update(id, { credentials });
    mutate();
  };

  const handleTest = async (id: string, recipient?: string) => {
    return apiForWorkspace.channels.test(id, recipient ? { recipient } : undefined);
  };

  const handleAddChannel = async (data: {
    name: string;
    slug: string;
    icon: string;
    credentials: Record<string, string>;
  }) => {
    await apiForWorkspace.channels.create(data);
    mutate();
  };

  const allChannels = channels ?? [];
  const filtered = allChannels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const existingSlugs = allChannels.map((c) => c.slug);

  return (
    <div className="flex flex-col gap-6">
      <div className="absolute top-4 right-4 flex items-center justify-end gap-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 pl-9"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Channel
        </Button>
      </div>

      {isLoading ? (
        <ProviderListSkeleton count={8} />
      ) : allChannels.length === 0 ? (
        <EmptyStatePlaceholder
          icon={Radio}
          title="No channels yet"
          description="Add your first communication channel to connect bots with Slack, Discord, webhooks, and more."
          actionLabel="Add Channel"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {filtered.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onToggle={handleToggle}
              onUpdateCredentials={handleUpdateCredentials}
              onTest={handleTest}
            />
          ))}
        </div>
      )}

      <ChannelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingSlugs={existingSlugs}
        workspaceId={workspaceId}
        onSave={handleAddChannel}
      />
    </div>
  );
}
