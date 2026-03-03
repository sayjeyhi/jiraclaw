"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onCreateProject: (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => Promise<JiraProject>;
  onProjectsChange: () => void;
}

export function StepTicketProvider({
  form,
  projects,
  onFormChange,
  onCreateProject,
  onProjectsChange,
}: StepTicketProviderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleCreateProject = async (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => {
    const created = await onCreateProject(data);
    onProjectsChange();
    setDialogOpen(false);
    onFormChange((prev) => ({
      ...prev,
      selectedTicketIntegration: "jira",
      selectedJiraProjectId: created.id,
    }));
  };

  return (
    <>
      <p className="text-muted-foreground text-xs">
        Connect a ticket provider (e.g. Jira) and link a project for this bot to monitor. Optional.
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
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
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
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleSelectProject(project.id)}
                      className={cn(
                        "border-border bg-card hover:border-primary/40 flex items-start justify-between gap-3 rounded-lg border p-4 text-left transition-all",
                        isSelected &&
                          "border-primary bg-primary/5 ring-primary/20 shadow-sm ring-2",
                      )}
                    >
                      <div className="min-w-0 flex-1">
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
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={null}
        onSave={handleCreateProject}
      />
    </>
  );
}
