"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { ProviderCard } from "@/components/ai/provider-card";
import { ProviderListSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import type { AIProvider } from "@/lib/types";

export default function AIModelsPage() {
  const { data: providers, isLoading, mutate } = useSWR<AIProvider[]>("/api/ai-models", fetcher);
  const [search, setSearch] = useState("");

  const handleToggle = async (id: string, enabled: boolean) => {
    await api.aiModels.update(id, { enabled });
    mutate();
  };

  const handleUpdateApiKey = async (id: string, apiKey: string) => {
    await api.aiModels.update(id, { apiKey });
    mutate();
  };

  const allProviders = providers ?? [];
  const filtered = allProviders.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const enabledProviders = filtered.filter((p) => p.enabled);
  const availableProviders = filtered.filter((p) => !p.enabled);

  return (
    <div className="flex flex-col gap-6 pb-2">
      <PageHeader
        title="AI Model Configuration"
        description="Configure AI providers, API keys, and select default models for your bots."
      >
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 pl-9"
          />
        </div>
      </PageHeader>

      {isLoading ? (
        <ProviderListSkeleton />
      ) : (
        <>
          {enabledProviders.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Enabled ({enabledProviders.length})
              </h2>
              <div className="flex flex-col gap-2">
                {enabledProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onToggle={handleToggle}
                    onUpdateApiKey={handleUpdateApiKey}
                  />
                ))}
              </div>
            </div>
          )}

          {availableProviders.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Available ({availableProviders.length})
              </h2>
              <div className="flex flex-col gap-2">
                {availableProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onToggle={handleToggle}
                    onUpdateApiKey={handleUpdateApiKey}
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
