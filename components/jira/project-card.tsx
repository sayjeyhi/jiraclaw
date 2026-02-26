"use client";

import Link from "next/link";
import {
  ExternalLink,
  FileText,
  GitBranch,
  MoreVertical,
  Pencil,
  RefreshCw,
  Tag,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { JiraProject } from "@/lib/types";
import { cn, formatFullDate } from "@/lib/utils";

interface ProjectCardProps {
  project: JiraProject;
  onEdit: (project: JiraProject) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  connected: { label: "Connected", className: "bg-success/15 text-success border-success/25" },
  syncing: { label: "Syncing", className: "bg-warning/15 text-warning border-warning/25" },
  error: { label: "Error", className: "bg-destructive/15 text-destructive border-destructive/25" },
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-card-foreground text-sm font-semibold">{project.name}</h3>
            <Badge variant="outline" className="text-[10px]">
              {project.key}
            </Badge>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary mt-1 flex items-center gap-1 text-xs"
          >
            <ExternalLink className="size-3" />
            {project.url}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] font-medium", status.className)}>
            {project.status === "syncing" && <RefreshCw className="mr-1 size-3 animate-spin" />}
            {status.label}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground size-8">
                <MoreVertical className="size-4" />
                <span className="sr-only">Project actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(project.id)}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Repositories */}
      <div>
        <h4 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase">
          <GitBranch className="size-3" />
          Repositories ({project.repositories.length})
        </h4>
        <div className="flex flex-col gap-2">
          {project.repositories.map((repo) => (
            <div
              key={repo.id}
              className="border-border bg-muted/50 flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {repo.label ?? "any"}
                </Badge>
                <span className="text-foreground text-sm">{repo.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {repo.branch}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
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
                  <span className="text-muted-foreground text-[10px]" suppressHydrationWarning>
                    {formatFullDate(repo.lastSync)}
                  </span>
                )}
                <Link href={`/logs?repo=${encodeURIComponent(repo.name)}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary h-6 gap-1 px-2 text-[10px]"
                  >
                    <FileText className="size-3" />
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Label Mappings */}
      {project.labelMappings.length > 0 && (
        <div>
          <h4 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase">
            <Tag className="size-3" />
            Label Mappings
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.labelMappings.map((mapping) => {
              const repo = project.repositories.find((r) => r.id === mapping.repositoryId);
              return (
                <div
                  key={mapping.label}
                  className="bg-primary/10 flex items-center gap-1 rounded-md px-2 py-1 text-xs"
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
}
