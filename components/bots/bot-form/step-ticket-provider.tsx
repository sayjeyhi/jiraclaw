"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectDialog } from "@/components/jira/project-dialog";
import { TICKET_INTEGRATIONS } from "./constants";
import type { FormState, FieldErrors } from "./types";
import type { JiraProject } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RepoRow {
  url: string;
  label: string;
}

interface StepTicketProviderProps {
  form: FormState;
  errors: FieldErrors;
  projects: JiraProject[];
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onClearError: (field: string) => void;
  onCreateProject: (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => Promise<JiraProject>;
  onEditProject?: (
    project: JiraProject,
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => Promise<void>;
  onProjectsChange: () => void;
}

export function StepTicketProvider({
  form,
  errors,
  projects,
  onFormChange,
  onClearError,
  onCreateProject,
  onEditProject,
  onProjectsChange,
}: StepTicketProviderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<JiraProject | null>(null);
  const [showToken, setShowToken] = useState(false);

  const handleSelectIntegration = (id: string) => {
    onFormChange((prev) => ({
      ...prev,
      selectedTicketIntegration: id,
      selectedJiraProjectId: id === "jira" ? prev.selectedJiraProjectId : "",
    }));
  };

  const handleSelectProject = (projectId: string) => {
    onFormChange((prev) => ({
      ...prev,
      selectedJiraProjectId: projectId === prev.selectedJiraProjectId ? "" : projectId,
    }));
  };

  const handleSaveProject = async (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => {
    if (editingProject && onEditProject) {
      await onEditProject(editingProject, data);
      onProjectsChange();
      setDialogOpen(false);
      setEditingProject(null);
    } else {
      const created = await onCreateProject(data);
      onProjectsChange();
      setDialogOpen(false);
      setEditingProject(null);
      onFormChange((prev) => ({
        ...prev,
        selectedTicketIntegration: "jira",
        selectedJiraProjectId: created.id,
      }));
    }
  };

  const openCreateDialog = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const openEditDialog = (project: JiraProject) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  return (
    <>
      <p className="text-muted-foreground text-xs">
        Connect a ticket provider (e.g. Jira) and link a project for this bot to monitor. Optionally
        add a GitHub token for repository access.
      </p>

      <div className="flex flex-col gap-6">
        {/* Integration type cards */}
        <div>
          <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Ticket integrations
          </h4>
          <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
            {TICKET_INTEGRATIONS.map((integration) => {
              const Icon = integration.icon;
              const isSelected = form.selectedTicketIntegration === integration.id;
              return (
                <button
                  key={integration.id}
                  type="button"
                  onClick={() => handleSelectIntegration(integration.id)}
                  className={cn(
                    "border-border bg-card hover:border-primary/40 flex items-start gap-4 rounded-lg border p-4 text-left transition-all",
                    isSelected && "border-primary bg-primary/5 ring-primary/20 shadow-sm ring-2",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md",
                      isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-card-foreground text-sm font-medium">
                        {integration.name}
                      </h3>
                      {isSelected && (
                        <Check className="text-primary size-4 shrink-0" strokeWidth={2.5} />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {integration.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project selection (when Jira is selected) */}
        {form.selectedTicketIntegration === "jira" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Jira projects
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={openCreateDialog}>
                <Plus className="mr-1.5 size-3.5" />
                Connect Project
              </Button>
            </div>
            {projects.length === 0 ? (
              <p className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
                No projects yet. Click <strong>Connect Project</strong> to add one.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                {projects.map((project) => {
                  const isSelected = form.selectedJiraProjectId === project.id;
                  return (
                    <div
                      key={project.id}
                      className={cn(
                        "border-border bg-card flex items-start justify-between gap-3 rounded-lg border p-4 transition-all",
                        isSelected &&
                          "border-primary bg-primary/5 ring-primary/20 shadow-sm ring-2",
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => handleSelectProject(project.id)}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-card-foreground text-sm font-medium">
                            {project.name}
                          </h3>
                          <span className="text-muted-foreground shrink-0 rounded border px-1.5 py-0.5 text-[10px]">
                            {project.key}
                          </span>
                          {isSelected && (
                            <Check className="text-primary size-4 shrink-0" strokeWidth={2.5} />
                          )}
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {project.url}
                        </p>
                      </button>
                      {onEditProject && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground size-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(project);
                          }}
                          aria-label="Edit project"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* GitHub token */}
        <div>
          <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            GitHub Token
          </h4>
          <div className="flex flex-col gap-2">
            <Label htmlFor="github-token">Token</Label>
            <div className="flex items-center gap-2">
              <Input
                id="github-token"
                type={showToken ? "text" : "password"}
                placeholder="ghp_..."
                value={form.githubToken}
                onChange={(e) => {
                  onFormChange((prev) => ({ ...prev, githubToken: e.target.value }));
                  onClearError("githubToken");
                }}
                aria-invalid={!!errors.githubToken}
                className={cn(
                  errors.githubToken && "border-destructive focus-visible:ring-destructive",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0"
                onClick={() => setShowToken((v) => !v)}
              >
                {showToken ? (
                  <EyeOff className="size-4" aria-label="Hide token" />
                ) : (
                  <Eye className="size-4" aria-label="Show token" />
                )}
              </Button>
            </div>
            {errors.githubToken ? (
              <p className="text-destructive text-[10px]">{errors.githubToken}</p>
            ) : (
              <p className="text-muted-foreground text-[10px]">
                Optional. Dedicated token for this bot to access repositories.
              </p>
            )}
          </div>
        </div>
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingProject(null);
          setDialogOpen(open);
        }}
        project={editingProject}
        onSave={handleSaveProject}
      />
    </>
  );
}
