"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LogEntry } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

interface LogEntryRowProps {
  entry: LogEntry;
}

const levelConfig = {
  info: { className: "bg-primary/15 text-primary border-primary/25" },
  warning: { className: "bg-warning/15 text-warning border-warning/25" },
  error: { className: "bg-destructive/15 text-destructive border-destructive/25" },
  debug: { className: "bg-muted text-muted-foreground border-border" },
};

const serviceLabels: Record<string, string> = {
  jira: "Jira",
  git: "Git",
  ai: "AI",
  channels: "Channels",
};

export function LogEntryRow({ entry }: LogEntryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMetadata = entry.metadata && Object.keys(entry.metadata).length > 0;
  const level = levelConfig[entry.level];

  return (
    <div
      className={cn(
        "border-border border-b transition-colors",
        entry.level === "error" && "bg-destructive/5",
      )}
    >
      <button
        onClick={() => hasMetadata && setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5 text-left",
          hasMetadata && "hover:bg-muted/50 cursor-pointer",
        )}
        disabled={!hasMetadata}
        type="button"
      >
        {hasMetadata ? (
          expanded ? (
            <ChevronDown className="text-muted-foreground size-3 shrink-0" />
          ) : (
            <ChevronRight className="text-muted-foreground size-3 shrink-0" />
          )
        ) : (
          <span className="size-3 shrink-0" />
        )}

        <span className="text-muted-foreground w-32 shrink-0 text-xs">
          {formatTime(entry.timestamp)}
        </span>

        <Badge
          variant="outline"
          className={cn("w-16 shrink-0 justify-center text-[10px] font-medium", level.className)}
        >
          {entry.level}
        </Badge>

        <Badge variant="secondary" className="w-16 shrink-0 justify-center text-[10px]">
          {serviceLabels[entry.service]}
        </Badge>

        <span className="text-muted-foreground w-20 shrink-0 truncate text-[10px]">
          {entry.repoName ?? "-"}
        </span>

        {entry.botId ? (
          <span className="text-muted-foreground w-12 shrink-0 text-[10px]">{entry.botId}</span>
        ) : (
          <span className="text-muted-foreground w-12 shrink-0 text-[10px]">-</span>
        )}

        <span className="text-foreground flex-1 truncate text-sm">{entry.message}</span>
      </button>

      {expanded && hasMetadata && (
        <div className="border-border bg-muted/30 border-t px-4 py-3 pl-10">
          <pre className="text-muted-foreground overflow-x-auto text-xs leading-relaxed">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
