"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { ChannelCard } from "@/components/channels/channel-card";
import { ProviderListSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import type { ChannelConfig } from "@/lib/types";

export default function ChannelsPage() {
  const { data: channels, isLoading, mutate } = useSWR<ChannelConfig[]>("/api/channels", fetcher);
  const [search, setSearch] = useState("");

  const handleToggle = async (id: string, enabled: boolean) => {
    await api.channels.update(id, { enabled });
    mutate();
  };

  const handleUpdateCredentials = async (id: string, credentials: Record<string, string>) => {
    await api.channels.update(id, { credentials });
    mutate();
  };

  const allChannels = channels ?? [];
  const filtered = allChannels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const enabledChannels = filtered.filter((c) => c.enabled);
  const availableChannels = filtered.filter((c) => !c.enabled);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Communication Channels"
        description="Configure inbound and outbound communication channels for your bots."
      >
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 pl-9"
          />
        </div>
      </PageHeader>

      {isLoading ? (
        <ProviderListSkeleton count={8} />
      ) : (
        <>
          {enabledChannels.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Active ({enabledChannels.length})
              </h2>
              <div className="grid gap-2 md:grid-cols-2">
                {enabledChannels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    onToggle={handleToggle}
                    onUpdateCredentials={handleUpdateCredentials}
                  />
                ))}
              </div>
            </div>
          )}

          {availableChannels.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Available ({availableChannels.length})
              </h2>
              <div className="grid gap-2 md:grid-cols-2">
                {availableChannels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    onToggle={handleToggle}
                    onUpdateCredentials={handleUpdateCredentials}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
