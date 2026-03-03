"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Kanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyStatePlaceholder } from "@/components/empty-state-placeholder";
import { ProjectCard } from "@/components/jira/project-card";
import { ProjectDialog } from "@/components/jira/project-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageSkeleton } from "@/components/loading-skeletons";
import { fetcher, api } from "@/lib/api";
import type { JiraProject } from "@/lib/types";

interface RepoRow {
  url: string;
  label: string;
}

export default function TicketIntegrationSettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const apiForWorkspace = api.forWorkspace(workspaceId);

  const {
    data: projects,
    isLoading,
    mutate,
  } = useSWR<JiraProject[]>(workspaceId ? `/api/w/${workspaceId}/jira` : null, fetcher);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<JiraProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JiraProject | null>(null);

  const handleCreate = async (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => {
    await apiForWorkspace.jira.create({
      name: data.name,
      key: data.key,
      url: data.url,
      apiKey: data.apiKey,
      repositories: data.repos.map((repo, i) => ({
        id: `repo-${Date.now()}-${i}`,
        name: repo.url.split("/").pop() ?? "repo",
        url: repo.url,
        branch: "main",
        label: repo.label,
        status: "cloning",
      })),
      labelMappings: [],
      status: "syncing",
    });
    mutate();
  };

  const handleEdit = async (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => {
    if (!editingProject) return;
    await apiForWorkspace.jira.update(editingProject.id, {
      name: data.name,
      key: data.key,
      url: data.url,
      ...(data.apiKey !== undefined && { apiKey: data.apiKey }),
      repositories: data.repos.map((repo, i) => {
        const existing = editingProject.repositories.find((r) => r.url === repo.url);
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
    mutate();
    setEditingProject(null);
  };

  if (isLoading) return <PageSkeleton />;

  const allProjects = projects ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditingProject(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Connect Project
        </Button>
      </div>

      {allProjects.length === 0 ? (
        <EmptyStatePlaceholder
          icon={Kanban}
          title="No projects connected"
          description="Connect your first Jira project and link GitHub repositories for automated monitoring."
          actionLabel="Connect Project"
          onAction={() => {
            setEditingProject(null);
            setDialogOpen(true);
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {allProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => {
                setEditingProject(p);
                setDialogOpen(true);
              }}
              onDelete={(id) => {
                const target = (projects ?? []).find((p) => p.id === id);
                if (target) setDeleteTarget(target);
              }}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSave={editingProject ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to disconnect "${deleteTarget?.name}"? All linked repositories and sync data will be removed.`}
        confirmLabel="Delete Project"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiForWorkspace.jira.delete(deleteTarget.id);
          mutate();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
