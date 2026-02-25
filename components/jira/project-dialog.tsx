"use client"

import { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { JiraProject } from "@/lib/types"

const MAX_REPOS = 3

const labelOptions = [
  { value: "any", label: "any" },
  { value: "backend", label: "backend" },
  { value: "frontend", label: "frontend" },
  { value: "mobile", label: "mobile" },
  { value: "infra", label: "infra" },
  { value: "devops", label: "devops" },
  { value: "docs", label: "docs" },
  { value: "testing", label: "testing" },
]

interface RepoRow {
  url: string
  label: string
}

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: JiraProject | null
  onSave: (data: Pick<JiraProject, "name" | "key" | "url"> & { repos: RepoRow[] }) => void
}

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [url, setUrl] = useState("")
  const [repos, setRepos] = useState<RepoRow[]>([{ url: "", label: "any" }])

  useEffect(() => {
    if (project) {
      setName(project.name)
      setKey(project.key)
      setUrl(project.url)
      setRepos(
        project.repositories.map((r) => ({
          url: r.url,
          label: r.label ?? "any",
        }))
      )
    } else {
      setName("")
      setKey("")
      setUrl("")
      setRepos([{ url: "", label: "any" }])
    }
  }, [project, open])

  const addRepo = () => {
    if (repos.length < MAX_REPOS) {
      setRepos((prev) => [...prev, { url: "", label: "any" }])
    }
  }

  const removeRepo = (index: number) => {
    setRepos((prev) => prev.filter((_, i) => i !== index))
  }

  const updateRepoUrl = (index: number, value: string) => {
    setRepos((prev) => prev.map((r, i) => (i === index ? { ...r, url: value } : r)))
  }

  const updateRepoLabel = (index: number, value: string) => {
    setRepos((prev) => prev.map((r, i) => (i === index ? { ...r, label: value } : r)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, key, url, repos: repos.filter((r) => r.url.trim()) })
    onOpenChange(false)
  }

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

          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Platform Core"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="projectKey">Project Key</Label>
                <Input
                  id="projectKey"
                  placeholder="PLAT"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jiraUrl">Jira URL</Label>
              <Input
                id="jiraUrl"
                placeholder="https://team.atlassian.net/browse/PLAT"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Repositories ({repos.length}/{MAX_REPOS})</Label>
              </div>
              <div className="flex flex-col gap-2">
                {repos.map((repo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground">Label</span>
                    <Select
                      value={repo.label}
                      onValueChange={(v) => updateRepoLabel(index, v)}
                    >
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
                      onChange={(e) => updateRepoUrl(index, e.target.value)}
                      className="flex-1"
                    />
                    {repos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRepo(index)}
                      >
                        <X className="size-4" />
                        <span className="sr-only">Remove repository</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {repos.length < MAX_REPOS && (
                <Button type="button" variant="outline" size="sm" onClick={addRepo}>
                  <Plus className="mr-1 size-3" />
                  Add Repository
                </Button>
              )}
              {repos.length >= MAX_REPOS && (
                <p className="text-xs text-muted-foreground">
                  Maximum of {MAX_REPOS} repositories per project.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {project ? "Save Changes" : "Connect Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
