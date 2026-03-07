"use client";

import Link from "next/link";
import { ExternalLink, FileText, FolderGit2, GitBranch, RefreshCw, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatFullDate } from "@/lib/utils";
import type { JiraProject } from "@/lib/types";

interface BotDetailReposProps {
  projects: JiraProject[];
}

const projectStatusConfig = {
  connected: { label: "Connected", className: "bg-success/15 text-success border-success/25" },
  syncing: { label: "Syncing", className: "bg-warning/15 text-warning border-warning/25" },
  error: { label: "Error", className: "bg-destructive/15 text-destructive border-destructive/25" },
};

export function BotDetailRepos({ projects }: BotDetailReposProps) {
  const allRepos = projects.flatMap((p) => p.repositories);

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderGit2 className="text-primary size-4" />
          <h3 className="text-sm font-medium">Projects & Repositories</h3>
        </div>
        <span className="text-muted-foreground text-xs">
          {projects.length} project{projects.length !== 1 ? "s" : ""}, {allRepos.length} repo
          {allRepos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground text-center text-xs">
            No projects linked to this bot.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => {
            const status = projectStatusConfig[project.status];
            return (
              <div key={project.id} className="border-border bg-muted/20 rounded-lg border p-3">
                {/* Project header */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-card-foreground text-xs font-semibold">
                        {project.name}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {project.key}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-medium", status.className)}
                      >
                        {project.status === "syncing" && (
                          <RefreshCw className="mr-1 size-2.5 animate-spin" />
                        )}
                        {status.label}
                      </Badge>
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary mt-0.5 flex items-center gap-1 text-[10px]"
                    >
                      <ExternalLink className="size-2.5" />
                      {project.url}
                    </a>
                  </div>
                </div>

                {/* Repositories */}
                {project.repositories.length === 0 ? (
                  <p className="text-muted-foreground text-[10px]">No repositories.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
                      <GitBranch className="size-2.5" />
                      Repositories ({project.repositories.length})
                    </h4>
                    {project.repositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="border-border bg-card flex items-center justify-between rounded-md border px-2.5 py-1.5"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {repo.label ?? "any"}
                          </Badge>
                          <span className="text-foreground truncate text-xs">{repo.name}</span>
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {repo.branch}
                          </Badge>
                        </div>
                        <div className="ml-2 flex shrink-0 items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              repo.status === "cloned" && "text-success border-success/25",
                              repo.status === "cloning" && "text-warning border-warning/25",
                              repo.status === "error" && "text-destructive border-destructive/25",
                            )}
                          >
                            {repo.status === "cloning" && (
                              <RefreshCw className="mr-1 size-2.5 animate-spin" />
                            )}
                            {repo.status}
                          </Badge>
                          {repo.lastSync && (
                            <span
                              className="text-muted-foreground text-[10px]"
                              suppressHydrationWarning
                            >
                              {formatFullDate(repo.lastSync)}
                            </span>
                          )}
                          <Link href={`/logs?repo=${encodeURIComponent(repo.name)}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-primary h-5 gap-1 px-1.5 text-[10px]"
                            >
                              <FileText className="size-2.5" />
                              Logs
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Label Mappings */}
                {project.labelMappings.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-muted-foreground mb-1 flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
                      <Tag className="size-2.5" />
                      Label Mappings
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {project.labelMappings.map((mapping) => {
                        const repo = project.repositories.find(
                          (r) => r.id === mapping.repositoryId,
                        );
                        return (
                          <div
                            key={mapping.label}
                            className="bg-primary/10 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px]"
                          >
                            <span className="text-primary">{mapping.label}</span>
                            <span className="text-muted-foreground">-{">"}</span>
                            <span className="text-foreground">{repo?.name ?? "unknown"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
