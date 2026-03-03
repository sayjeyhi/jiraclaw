"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, GitBranch, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectDialog } from "@/components/jira/project-dialog";
import { TICKET_INTEGRATIONS } from "./constants";
import type { FormState, FieldErrors } from "./types";
import type { JiraProject } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_REPOS = 3;

const labelOptions = [
  { value: "any", label: "any" },
  { value: "backend", label: "backend" },
  { value: "frontend", label: "frontend" },
  { value: "mobile", label: "mobile" },
  { value: "infra", label: "infra" },
  { value: "devops", label: "devops" },
  { value: "docs", label: "docs" },
  { value: "testing", label: "testing" },
];

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
  const [inputFocused, setInputFocused] = useState(false);
  const [addingRepoForProjectId, setAddingRepoForProjectId] = useState<string | null>(null);
  const [inlineRepoUrl, setInlineRepoUrl] = useState("");
  const [inlineRepoLabel, setInlineRepoLabel] = useState("any");
  const [addingRepoLoading, setAddingRepoLoading] = useState(false);

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

  const startAddingRepo = (projectId: string) => {
    setAddingRepoForProjectId(projectId);
    setInlineRepoUrl("");
    setInlineRepoLabel("any");
  };

  const cancelAddingRepo = () => {
    setAddingRepoForProjectId(null);
    setInlineRepoUrl("");
  };

  const handleAddRepoInline = async (project: JiraProject) => {
    const url = inlineRepoUrl.trim();
    if (!url || !onEditProject) return;
    setAddingRepoLoading(true);
    try {
      const existingRepos: RepoRow[] = project.repositories.map((r) => ({
        url: r.url,
        label: r.label ?? "any",
      }));
      await onEditProject(project, {
        name: project.name,
        key: project.key,
        url: project.url,
        repos: [...existingRepos, { url, label: inlineRepoLabel }],
      });
      onProjectsChange();
      setAddingRepoForProjectId(null);
      setInlineRepoUrl("");
      setInlineRepoLabel("any");
    } finally {
      setAddingRepoLoading(false);
    }
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
              const isDisabled = integration.disabled;
              return (
                <div
                  key={integration.id}
                  role={isDisabled ? undefined : "button"}
                  tabIndex={isDisabled ? undefined : 0}
                  onKeyDown={
                    isDisabled
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectIntegration(integration.id);
                          }
                        }
                  }
                  onClick={isDisabled ? undefined : () => handleSelectIntegration(integration.id)}
                  className={cn(
                    "border-border flex items-start gap-4 rounded-lg border p-4 text-left transition-all",
                    isDisabled
                      ? "bg-muted/30 cursor-not-allowed opacity-60"
                      : "bg-card hover:border-primary/40 cursor-pointer",
                    !isDisabled &&
                      isSelected &&
                      "border-primary bg-primary/5 ring-primary/20 shadow-sm ring-2",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md",
                      isDisabled && "bg-muted text-muted-foreground",
                      !isDisabled &&
                        (isSelected
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"),
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-card-foreground text-sm font-medium">
                        {integration.name}
                      </h3>
                      {isDisabled && (
                        <span className="text-muted-foreground rounded border px-1.5 py-0.5 text-[10px]">
                          Coming soon
                        </span>
                      )}
                      {!isDisabled && isSelected && (
                        <Check className="text-primary size-4 shrink-0" strokeWidth={2.5} />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {integration.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project selection (when Jira is selected) */}
        {form.selectedTicketIntegration === "jira" && (
          <div className="w-full">
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
              <div className="flex w-full flex-col gap-3">
                {projects.map((project) => {
                  const isSelected = form.selectedJiraProjectId === project.id;
                  return (
                    <div
                      key={project.id}
                      className={cn(
                        "border-border bg-card flex w-full flex-col gap-3 rounded-lg border p-4 transition-all",
                        isSelected &&
                          "border-primary bg-primary/5 ring-primary/20 shadow-sm ring-2",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
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
                        <div className="flex shrink-0 items-center gap-0.5">
                          {onEditProject && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground size-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(project);
                              }}
                              aria-label="Edit project"
                              title="Edit project"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Repositories */}
                      <div className="border-border border-t pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase">
                            <GitBranch className="size-3" />
                            Repositories ({project.repositories.length})
                          </h4>
                          {onEditProject &&
                            project.repositories.length < MAX_REPOS &&
                            addingRepoForProjectId !== project.id && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startAddingRepo(project.id);
                                }}
                              >
                                <Plus className="size-3" />
                                Add repo
                              </Button>
                            )}
                        </div>
                        {project.repositories.length === 0 &&
                        addingRepoForProjectId !== project.id ? (
                          <p className="text-muted-foreground rounded-md border border-dashed py-4 text-center text-xs">
                            No repositories linked. Click <strong>Add repo</strong> to connect
                            GitHub repos.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {project.repositories.map((repo) => (
                              <div
                                key={repo.id}
                                className="border-border bg-muted/30 flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="text-muted-foreground shrink-0 rounded border px-1.5 py-0.5 text-[10px]">
                                    {repo.label ?? "any"}
                                  </span>
                                  <span className="text-foreground truncate text-sm">
                                    {repo.name}
                                  </span>
                                </div>
                                <span className="text-muted-foreground shrink-0 truncate text-xs">
                                  {repo.url}
                                </span>
                              </div>
                            ))}
                            {addingRepoForProjectId === project.id && (
                              <div className="border-border bg-accent flex items-center gap-2 rounded-md border px-3 py-2">
                                <span className="text-xs">Ticket Label:</span>
                                <Select value={inlineRepoLabel} onValueChange={setInlineRepoLabel}>
                                  <SelectTrigger className="bg-card h-8 w-24 shrink-0 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {labelOptions.map((opt) => (
                                      <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                        className="text-xs"
                                      >
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="https://github.com/org/repo"
                                  value={inlineRepoUrl}
                                  onChange={(e) => setInlineRepoUrl(e.target.value)}
                                  className="bg-card min-w-0 flex-1 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-foreground size-7 shrink-0"
                                  onClick={cancelAddingRepo}
                                >
                                  <X className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 shrink-0"
                                  disabled={!inlineRepoUrl.trim() || addingRepoLoading}
                                  onClick={() => handleAddRepoInline(project)}
                                >
                                  {addingRepoLoading ? "Adding…" : "Add"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
            <div className="relative max-w-120">
              <Tooltip open={inputFocused}>
                <TooltipTrigger asChild>
                  <Input
                    id="github-token"
                    type="text"
                    placeholder="ghp_..."
                    autoComplete="off"
                    value={form.githubToken}
                    onChange={(e) => {
                      onFormChange((prev) => ({ ...prev, githubToken: e.target.value }));
                      onClearError("githubToken");
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    aria-invalid={!!errors.githubToken}
                    className={cn(
                      "pr-9 font-mono text-xs",
                      errors.githubToken && "border-destructive focus-visible:ring-destructive",
                    )}
                    style={
                      !showToken && form.githubToken
                        ? ({
                            WebkitTextSecurity: "disc",
                            textSecurity: "disc",
                          } as React.CSSProperties)
                        : undefined
                    }
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>
                    Your token is stored securely and never shared. Optional for repository access.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-0 size-8 shrink-0 -translate-y-1/2"
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
