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
  BrainCircuit,
  Key,
  Ticket,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BotConfig, BotTicket } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BotCardProps {
  bot: BotConfig;
  tickets: BotTicket[];
  editHref?: string;
  onEdit?: (bot: BotConfig) => void;
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

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function BotCard({ bot, tickets, editHref, onEdit, onDelete, workspaceId }: BotCardProps) {
  const status = statusConfig[bot.status];
  const recentTickets = tickets.slice(0, 5);

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    inReview: tickets.filter((t) => t.status === "in_review").length,
    done: tickets.filter((t) => t.status === "done").length,
    failed: tickets.filter((t) => t.status === "failed").length,
  };

  const botHref = workspaceId ? `/w/${workspaceId}/bots/${bot.id}` : `/bots/${bot.id}`;
  const ticketHref = (t: BotTicket) =>
    workspaceId
      ? `/w/${workspaceId}/bots/${bot.id}?ticket=${t.id}`
      : `/bots/${bot.id}?ticket=${t.id}`;

  return (
    <Link
      href={botHref}
      className="group border-border bg-card hover:border-primary/30 relative flex flex-col gap-5 rounded-lg border p-3 transition-colors"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-lg">
            <Bot className="text-primary size-6" />
          </div>
          <div>
            <h2 className="text-card-foreground hover:text-primary text-base font-semibold transition-colors">
              {bot.title}
            </h2>
            <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
              <Mail className="size-3.5" />
              <span>{bot.email}</span>
            </div>
            {bot.createdAt && (
              <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px]">
                <Calendar className="size-3" />
                <span>Created {formatDate(bot.createdAt)}</span>
              </div>
            )}
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
            {editHref ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground size-6"
                asChild
              >
                <Link href={editHref}>
                  <Pencil className="size-3.5" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
            ) : onEdit ? (
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
            ) : null}
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

      {/* Config & recent tickets row */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Config info */}
        <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
          <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Configuration
          </span>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-primary size-4 shrink-0" />
              <span className="text-muted-foreground text-xs">
                {bot.defaultModel ? `${bot.defaultProvider}/${bot.defaultModel}` : "No model set"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="text-chart-2 size-4 shrink-0" />
              <span className="text-muted-foreground text-xs">
                {bot.githubToken ? "Token configured" : "No token"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="text-chart-3 size-4 shrink-0" />
              <span className="text-muted-foreground text-xs">
                {bot.spendingLimit ? `$${bot.spendingLimit}/mo` : "Unlimited"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {bot.autonomyLevel === "autonomous" ? (
                <Zap className="text-primary size-4 shrink-0" />
              ) : (
                <Eye className="text-warning size-4 shrink-0" />
              )}
              <span className="text-muted-foreground text-xs">
                {bot.autonomyLevel === "autonomous" ? "Autonomous" : "Supervised"}
              </span>
            </div>
            {bot.enabledChannels?.length > 0 && (
              <div className="flex items-center gap-2">
                <MessageSquare className="text-chart-4 size-4 shrink-0" />
                <span className="text-muted-foreground text-xs">
                  {bot.enabledChannels.length} channel{bot.enabledChannels.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent tickets */}
        <div className="border-border flex flex-col gap-2 rounded-lg border p-4">
          <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Recent Tickets
          </span>
          {recentTickets.length > 0 ? (
            <div className="flex flex-col gap-1.5">
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
          ) : (
            <p className="text-muted-foreground py-4 text-center text-xs">No tickets yet</p>
          )}
        </div>
      </div>
    </Link>
  );
}
