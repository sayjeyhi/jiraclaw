"use client";

import { useParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { ProviderCard } from "@/components/ai/provider-card";
import { fetcher, api } from "@/lib/api";
import { ALLOWED_AI_PROVIDERS } from "@/lib/constants/allowed-ai-providers";
import type { AIProvider } from "@/lib/types";
import useSWR from "swr";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIModelsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);
  const {
    data: providers,
    isLoading,
    mutate,
  } = useSWR<AIProvider[]>(workspaceId ? `/api/w/${workspaceId}/ai-models` : null, fetcher);

  const providerMap = new Map((providers ?? []).map((p) => [p.slug, p]));

  const handleToggle = async (id: string, enabled: boolean) => {
    await apiForWorkspace.aiModels.update(id, { enabled });
    mutate();
  };

  const handleSave = async (slug: string, apiKey: string, enabled: boolean) => {
    const template = ALLOWED_AI_PROVIDERS.find((p) => p.slug === slug);
    if (!template) return;
    const existing = providerMap.get(slug);
    const providerId = existing?.id ?? `${workspaceId}-${slug}`;

    if (existing) {
      await apiForWorkspace.aiModels.update(providerId, {
        apiKey: apiKey.trim() || undefined,
        enabled,
      });
    } else {
      await apiForWorkspace.aiModels.create({
        name: template.name,
        slug: template.slug,
        apiKey: apiKey.trim() || undefined,
        enabled: true,
      });
    }
    mutate();
  };

  const allProviders = providers ?? [];
  const hasConfigured = allProviders.some((p) => p.enabled);

  return (
    <div className="flex flex-col gap-6 pb-2">
      <PageHeader
        title="AI Providers"
        description="Configure AI providers and API keys for your workspace."
      />

      {!hasConfigured && allProviders.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-50/50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          <TriangleAlert className="size-4" />
          <AlertTitle>No AI provider enabled</AlertTitle>
          <AlertDescription>
            Enable at least one provider below before you can create bots or use AI features.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <CardGridSkeleton count={6} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Providers ({ALLOWED_AI_PROVIDERS.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {ALLOWED_AI_PROVIDERS.map((template) => (
              <ProviderCard
                key={template.slug}
                template={template}
                workspaceProvider={providerMap.get(template.slug)}
                onToggle={handleToggle}
                onSave={handleSave}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
