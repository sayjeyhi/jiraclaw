"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { BrainCircuit, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { EmptyStatePlaceholder } from "@/components/empty-state-placeholder";
import { ProviderCard } from "@/components/ai/provider-card";
import { ConfigureProviderDialog } from "@/components/ai/configure-provider-dialog";
import { fetcher, api } from "@/lib/api";
import { ALLOWED_AI_PROVIDERS } from "@/lib/constants/allowed-ai-providers";
import { AIProvider, AllowedAIProvider } from "@/lib/types";
import useSWR from "swr";
import { ProviderListSkeleton } from "@/components/loading-skeletons";

export default function AIModelsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);
  const {
    data: providers,
    isLoading,
    mutate,
  } = useSWR<AIProvider[]>(workspaceId ? `/api/w/${workspaceId}/ai-models` : null, fetcher);

  const [allowedProviders, setAllowedProviders] =
    useState<AllowedAIProvider[]>(ALLOWED_AI_PROVIDERS);
  const [configureOpen, setConfigureOpen] = useState(false);

  const handleToggle = async (id: string, enabled: boolean) => {
    await apiForWorkspace.aiModels.update(id, { enabled });
    mutate();
  };

  const handleUpdateApiKey = async (id: string, apiKey: string) => {
    await apiForWorkspace.aiModels.update(id, { apiKey });
    mutate();
  };

  const allProviders = providers ?? [];
  const hasConfigured = allProviders.some((p) => p.enabled);

  return (
    <div className="flex flex-col gap-6 pb-2">
      <PageHeader title="AI Providers" description="Configure AI providers, API keys">
        <div className="flex items-center gap-3">
          <Button onClick={() => setConfigureOpen(true)}>Configure AI provider</Button>
        </div>
      </PageHeader>

      {!hasConfigured && allProviders.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-50/50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          <TriangleAlert className="size-4" />
          <AlertTitle>No AI provider enabled</AlertTitle>
          <AlertDescription>
            You need at least one configured AI provider before you can create bots or use AI
            features.{" "}
            <button
              type="button"
              onClick={() => setConfigureOpen(true)}
              className="font-medium underline underline-offset-2"
            >
              Configure one now
            </button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <ProviderListSkeleton />
      ) : allProviders.length === 0 ? (
        <EmptyStatePlaceholder
          icon={BrainCircuit}
          title="No AI provider configured"
          description="Add AI providers and configure API keys to power your bots."
          actionLabel="Configure AI provider"
          onAction={() => setConfigureOpen(true)}
        />
      ) : (
        <>
          {allProviders.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Available ({allProviders.length})
              </h2>
              <div className="flex flex-col gap-2">
                {allProviders.map((provider) => (
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

      <ConfigureProviderDialog
        open={configureOpen}
        onOpenChange={setConfigureOpen}
        providers={allowedProviders}
        workspaceId={workspaceId}
        onSuccess={(id, apiKey) =>
          setAllowedProviders((prev) =>
            prev.map((p) => (p.id === id ? { ...p, apiKey, enabled: true } : p)),
          )
        }
      />
    </div>
  );
}
