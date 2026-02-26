"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JiraProject } from "@/lib/types";

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

type InternalRepoRow = RepoRow & { id: string };

interface DialogState {
  name: string;
  key: string;
  url: string;
  apiKey: string;
  repos: InternalRepoRow[];
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: JiraProject | null;
  onSave: (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => void;
}

const defaultState: DialogState = {
  name: "",
  key: "",
  url: "",
  apiKey: "",
  repos: [{ id: crypto.randomUUID(), url: "", label: "any" }],
};

function resetState(project: JiraProject | null | undefined): DialogState {
  if (project) {
    return {
      name: project.name,
      key: project.key,
      url: project.url,
      apiKey: project.apiKey ?? "",
      repos: project.repositories.map((r) => ({ id: r.id, url: r.url, label: r.label ?? "any" })),
    };
  }
  return { ...defaultState, repos: [{ id: crypto.randomUUID(), url: "", label: "any" }] };
}

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const [state, setState] = useState<DialogState>(defaultState);

  useEffect(() => {
    if (!open) return;
    setState(resetState(project));
  }, [project, open]);

  const addRepo = () => {
    if (state.repos.length < MAX_REPOS) {
      setState((prev) => ({
        ...prev,
        repos: [...prev.repos, { id: crypto.randomUUID(), url: "", label: "any" }],
      }));
    }
  };

  const removeRepo = (id: string) => {
    setState((prev) => ({ ...prev, repos: prev.repos.filter((r) => r.id !== id) }));
  };

  const updateRepoUrl = (id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      repos: prev.repos.map((r) => (r.id === id ? { ...r, url: value } : r)),
    }));
  };

  const updateRepoLabel = (id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      repos: prev.repos.map((r) => (r.id === id ? { ...r, label: value } : r)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: state.name,
      key: state.key,
      url: state.url,
      apiKey: state.apiKey.trim() || undefined,
      repos: state.repos.filter((r) => r.url.trim()).map(({ url, label }) => ({ url, label })),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{project ? "Edit Project" : "Connect Jira Project"}</DialogTitle>
            <DialogDescription>
              Link a Jira project and up to {MAX_REPOS} GitHub repositories.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Platform Core"
                  value={state.name}
                  onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="projectKey">Project Key</Label>
                <Input
                  id="projectKey"
                  placeholder="PLAT"
                  value={state.key}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, key: e.target.value.toUpperCase() }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jiraUrl">Jira URL</Label>
              <Input
                id="jiraUrl"
                placeholder="https://team.atlassian.net/browse/PLAT"
                value={state.url}
                onChange={(e) => setState((prev) => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jiraApiKey">Jira API Key</Label>
              <Input
                id="jiraApiKey"
                type="password"
                placeholder="Your Jira API token"
                value={state.apiKey}
                onChange={(e) => setState((prev) => ({ ...prev, apiKey: e.target.value }))}
                autoComplete="off"
              />
              <p className="text-muted-foreground text-xs">
                Create an API token from your Atlassian account settings for Jira Cloud.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>
                  Repositories ({state.repos.length}/{MAX_REPOS})
                </Label>
              </div>
              <div className="flex flex-col gap-2">
                {state.repos.map((repo) => (
                  <div key={repo.id} className="flex items-center gap-2">
                    <span className="text-muted-foreground shrink-0 text-xs">Label</span>
                    <Select value={repo.label} onValueChange={(v) => updateRepoLabel(repo.id, v)}>
                      <SelectTrigger className="w-28 shrink-0 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {labelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="https://github.com/org/repo"
                      value={repo.url}
                      onChange={(e) => updateRepoUrl(repo.id, e.target.value)}
                      className="flex-1"
                    />
                    {state.repos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                        onClick={() => removeRepo(repo.id)}
                      >
                        <X className="size-4" />
                        <span className="sr-only">Remove repository</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {state.repos.length < MAX_REPOS && (
                <Button type="button" variant="outline" size="sm" onClick={addRepo}>
                  <Plus className="mr-1 size-3" />
                  Add Repository
                </Button>
              )}
              {state.repos.length >= MAX_REPOS && (
                <p className="text-muted-foreground text-xs">
                  Maximum of {MAX_REPOS} repositories per project.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{project ? "Save Changes" : "Connect Project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
