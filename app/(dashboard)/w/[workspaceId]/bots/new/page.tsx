"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { BotForm } from "@/components/bots/bot-form";
import { PageSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import { mergeProvidersWithModels } from "@/lib/merge-ai-providers";
import { ALLOWED_AI_PROVIDERS } from "@/lib/constants/allowed-ai-providers";
import type { BotConfig, AIProvider, ChannelConfig, JiraProject, SystemPrompt } from "@/lib/types";

interface RepoRow {
  url: string;
  label: string;
}

export default function NewBotPage() {
  const params = useParams();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);

  const {
    data: providersRaw = [],
    isLoading: isLoadingProviders,
    mutate: mutateProviders,
  } = useSWR<AIProvider[]>(workspaceId ? `/api/w/${workspaceId}/ai-models` : null, fetcher);
  const providers = mergeProvidersWithModels(providersRaw);
  const { data: prompts = [], mutate: mutatePrompts } = useSWR<SystemPrompt[]>(
    workspaceId ? `/api/w/${workspaceId}/prompts` : null,
    fetcher,
  );
  const { data: jiraProjects = [], mutate: mutateJira } = useSWR<JiraProject[]>(
    workspaceId ? `/api/w/${workspaceId}/jira` : null,
    fetcher,
  );
  const { data: channels = [], mutate: mutateChannels } = useSWR<ChannelConfig[]>(
    workspaceId ? `/api/w/${workspaceId}/channels` : null,
    fetcher,
  );

  const handleAiSave = async (slug: string, apiKey: string, enabled: boolean) => {
    const template = ALLOWED_AI_PROVIDERS.find((p) => p.slug === slug);
    if (!template) return;
    const existing = (providersRaw ?? []).find((p) => p.slug === slug);
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
    mutateProviders();
  };

  const handleCreatePrompt = async (data: {
    name: string;
    content: string;
    isGlobal: boolean;
    botIds?: string[];
  }) => {
    const created = (await apiForWorkspace.prompts.create(data)) as { id: string };
    mutatePrompts();
    return created;
  };

  const handleCreateJiraProject = async (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => {
    const created = (await apiForWorkspace.jira.create({
      name: data.name,
      key: data.key,
      url: data.url,
      apiKey: data.apiKey,
      repositories: data.repos
        .filter((r) => r.url.trim())
        .map((repo, i) => ({
          id: `repo-${Date.now()}-${i}`,
          name: repo.url.split("/").pop() ?? "repo",
          url: repo.url,
          branch: "main",
          label: repo.label,
          status: "cloning",
        })),
      labelMappings: [],
      status: "syncing",
    })) as JiraProject;
    mutateJira();
    return created;
  };

  const handleCreateChannel = async (data: {
    name: string;
    slug: string;
    icon: string;
    credentials: Record<string, string>;
  }) => {
    const created = (await apiForWorkspace.channels.create(data)) as ChannelConfig;
    mutateChannels();
    return created;
  };

  const handleEditJiraProject = async (
    project: JiraProject,
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => {
    await apiForWorkspace.jira.update(project.id, {
      name: data.name,
      key: data.key,
      url: data.url,
      ...(data.apiKey !== undefined && { apiKey: data.apiKey }),
      repositories: data.repos.map((repo, i) => {
        const existing = project.repositories.find((r) => r.url === repo.url);
        return existing
          ? { ...existing, label: repo.label }
          : {
              id: `repo-${Date.now()}-${i}`,
              name: repo.url.split("/").pop() ?? "repo",
              url: repo.url,
              branch: "main",
              label: repo.label,
              status: "cloning",
            };
      }),
    });
    mutateJira();
  };

  const handleSave = async (
    data: Omit<BotConfig, "id" | "createdAt" | "status"> & { jiraProjectId?: string },
  ) => {
    const { jiraProjectId, ...botData } = data;
    const created = (await apiForWorkspace.bots.create({
      ...botData,
      jiraProjectId,
    } as unknown as Record<string, unknown>)) as BotConfig;
    await mutate(`/api/w/${workspaceId}/bots`);
    router.push(`/w/${workspaceId}/bots/${created.id}`);
  };

  if (isLoadingProviders) return <PageSkeleton />;

  return (
    <BotForm
      bot={null}
      providers={providers}
      prompts={prompts}
      onCreatePrompt={handleCreatePrompt}
      onPromptsChange={() => mutatePrompts()}
      jiraProjects={jiraProjects}
      onCreateJiraProject={handleCreateJiraProject}
      onEditJiraProject={handleEditJiraProject}
      onJiraProjectsChange={() => mutateJira()}
      onAiSave={handleAiSave}
      onAiProvidersChange={() => mutateProviders()}
      channels={channels}
      onCreateChannel={handleCreateChannel}
      onChannelsChange={() => mutateChannels()}
      onSave={handleSave}
    />
  );
}
