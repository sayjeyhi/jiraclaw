"use client";

import Link from "next/link";
import {
  Bot,
  Mail,
  Pencil,
  Trash2,
  GitBranch,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  XCircle,
  Zap,
  Eye,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BotConfig, BotTicket } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BotCardProps {
  bot: BotConfig;
  tickets: BotTicket[];
  onEdit: (bot: BotConfig) => void;
  onDelete: (id: string) => void;
  workspaceId?: string;
}

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/25" },
  working: { label: "Working", className: "bg-primary/15 text-primary border-primary/25" },
  idle: { label: "Idle", className: "bg-muted text-muted-foreground border-border" },
  error: { label: "Error", className: "bg-destructive/15 text-destructive border-destructive/25" },
};

const ticketStatusIcon: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="text-success size-3.5" />,
  in_review: <Search className="text-chart-1 size-3.5" />,
  in_progress: <Loader2 className="text-warning size-3.5" />,
  open: <Circle className="text-muted-foreground size-3.5" />,
  failed: <XCircle className="text-destructive size-3.5" />,
};

const priorityColor: Record<string, string> = {
  critical: "text-destructive",
  high: "text-warning",
  medium: "text-chart-1",
  low: "text-muted-foreground",
};

export function BotCard({ bot, tickets, onEdit, onDelete, workspaceId }: BotCardProps) {
  const status = statusConfig[bot.status];
  const recentTickets = tickets.slice(0, 3);
  const botHref = workspaceId ? `/w/${workspaceId}/bots/${bot.id}` : `/bots/${bot.id}`;
  const ticketHref = (t: BotTicket) =>
    workspaceId
      ? `/w/${workspaceId}/bots/${bot.id}?ticket=${t.id}`
      : `/bots/${bot.id}?ticket=${t.id}`;

  return (
    <div className="group border-border bg-card hover:border-primary/30 relative flex flex-col gap-4 rounded-lg border p-5 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
            <Bot className="text-primary size-5" />
          </div>
          <div>
            <Link
              href={botHref}
              className="text-card-foreground hover:text-primary text-sm font-semibold transition-colors"
            >
              {bot.title}
            </Link>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
              <Mail className="size-3" />
              <span>{bot.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] font-medium", status.className)}>
            <span
              className={cn(
                "mr-1 inline-block size-1.5 rounded-full",
                bot.status === "active" && "bg-success",
                bot.status === "working" && "bg-primary animate-pulse",
                bot.status === "idle" && "bg-muted-foreground",
                bot.status === "error" && "bg-destructive",
              )}
            />
            {status.label}
          </Badge>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-6"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bot);
              }}
            >
              <Pencil className="size-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-6"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bot.id);
              }}
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
        {bot.botSkillDescription}
      </p>

      {recentTickets.length > 0 && (
        <div className="border-border flex flex-col gap-2 border-t pt-3">
          <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Recent Tickets
          </span>
          <div className="flex min-h-24 flex-col gap-1.5">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={ticketHref(ticket)}
                className="bg-muted/50 hover:bg-muted flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {ticketStatusIcon[ticket.status]}
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-semibold",
                    priorityColor[ticket.priority],
                  )}
                >
                  {ticket.key}
                </span>
                <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                  {ticket.summary}
                </span>
                {ticket.branch && (
                  <GitBranch className="text-muted-foreground/50 ml-auto size-3 shrink-0" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="border-border flex flex-wrap items-center gap-2 border-t pt-3">
        {bot.defaultModel && (
          <Badge variant="secondary" className="gap-1 text-[10px]">
            {bot.defaultProvider}/{bot.defaultModel}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn(
            "gap-1 text-[10px]",
            bot.autonomyLevel === "autonomous"
              ? "text-primary border-primary/25"
              : "text-warning border-warning/25",
          )}
        >
          {bot.autonomyLevel === "autonomous" ? (
            <Zap className="size-2.5" />
          ) : (
            <Eye className="size-2.5" />
          )}
          {bot.autonomyLevel === "autonomous" ? "Autonomous" : "Supervised"}
        </Badge>
        {bot.spendingLimit && (
          <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px]">
            <DollarSign className="size-2.5" />
            {bot.spendingLimit}/mo
          </Badge>
        )}
        {bot.githubToken && (
          <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px]">
            <GitBranch className="size-2.5" />
            Token set
          </Badge>
        )}
      </div>
    </div>
  );
}
