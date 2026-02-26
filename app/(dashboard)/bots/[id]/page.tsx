"use client";

import { use, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowLeft,
  Bot,
  Mail,
  GitBranch,
  MessageSquare,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  XCircle,
  ChevronDown,
  ChevronRight,
  Hash,
  ExternalLink,
  Zap,
  Eye,
  DollarSign,
  Key,
  BrainCircuit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotDetailSkeleton } from "@/components/loading-skeletons";
import { fetcher } from "@/lib/api";
import type { BotConfig, BotTicket, TicketAction } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const ticketStatusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  done: {
    label: "Done",
    icon: <CheckCircle2 className="size-4" />,
    className: "bg-success/15 text-success border-success/25",
  },
  in_review: {
    label: "In Review",
    icon: <Search className="size-4" />,
    className: "bg-chart-1/15 text-chart-1 border-chart-1/25",
  },
  in_progress: {
    label: "In Progress",
    icon: <Loader2 className="size-4" />,
    className: "bg-warning/15 text-warning border-warning/25",
  },
  open: {
    label: "Open",
    icon: <Circle className="size-4" />,
    className: "bg-muted text-muted-foreground border-border",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="size-4" />,
    className: "bg-destructive/15 text-destructive border-destructive/25",
  },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-destructive/15 text-destructive border-destructive/25",
  },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/25" },
  medium: { label: "Medium", className: "bg-chart-1/15 text-chart-1 border-chart-1/25" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

const actionIcon: Record<string, React.ReactNode> = {
  branch_created: <GitBranch className="text-chart-2 size-3.5" />,
  pr_opened: <ExternalLink className="text-chart-1 size-3.5" />,
  comment_added: <MessageSquare className="text-muted-foreground size-3.5" />,
  status_changed: <Circle className="text-warning size-3.5" />,
  message_sent: <Hash className="text-chart-1 size-3.5" />,
  review_submitted: <Search className="text-chart-4 size-3.5" />,
  merged: <CheckCircle2 className="text-success size-3.5" />,
};

function TicketRow({ ticket }: { ticket: BotTicket }) {
  const [expanded, setExpanded] = useState(false);
  const status = ticketStatusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  return (
    <div className="border-border bg-card rounded-lg border">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-accent/50 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        {expanded ? (
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        ) : (
          <ChevronRight className="text-muted-foreground size-4 shrink-0" />
        )}
        <span className="text-foreground shrink-0 text-xs font-semibold">{ticket.key}</span>
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
          {ticket.summary}
        </span>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", status.className)}>
          {status.icon}
          <span className="ml-1">{status.label}</span>
        </Badge>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", priority.className)}>
          {priority.label}
        </Badge>
      </button>

      {expanded && (
        <div className="border-border border-t px-4 py-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-3 lg:col-span-1">
              <h4 className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Details
              </h4>
              <div className="flex flex-col gap-2 text-xs">
                {ticket.branch && (
                  <div className="flex items-center gap-2">
                    <GitBranch className="text-muted-foreground size-3.5" />
                    <span className="text-foreground">{ticket.branch}</span>
                  </div>
                )}
                {ticket.repoName && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="text-muted-foreground size-3.5" />
                    <span className="text-foreground">{ticket.repoName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Circle className="text-muted-foreground size-3.5" />
                  <span className="text-muted-foreground">
                    Assigned {formatDate(ticket.assignedAt)}
                  </span>
                </div>
                {ticket.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-success size-3.5" />
                    <span className="text-muted-foreground">
                      Completed {formatDate(ticket.completedAt)}
                    </span>
                  </div>
                )}
              </div>
              {ticket.channelMessages.length > 0 && (
                <div className="flex flex-col gap-2 pt-2">
                  <h4 className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                    Messages Sent ({ticket.channelMessages.length})
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {ticket.channelMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-muted/50 flex items-start gap-2 rounded-md px-2.5 py-2"
                      >
                        <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">
                          {msg.channel}
                        </Badge>
                        <span className="text-muted-foreground min-w-0 flex-1 text-[11px] leading-relaxed">
                          {msg.message}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[9px]",
                            msg.status === "delivered" && "text-success border-success/25",
                            msg.status === "failed" && "text-destructive border-destructive/25",
                            msg.status === "pending" && "text-warning border-warning/25",
                          )}
                        >
                          {msg.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 lg:col-span-2">
              <h4 className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Activity Timeline ({ticket.actions.length} events)
              </h4>
              <div className="relative flex flex-col gap-0">
                {ticket.actions.map((action: TicketAction, idx: number) => (
                  <div key={action.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="border-border bg-muted flex size-7 items-center justify-center rounded-full border">
                        {actionIcon[action.type] ?? (
                          <Circle className="text-muted-foreground size-3.5" />
                        )}
                      </div>
                      {idx < ticket.actions.length - 1 && <div className="bg-border w-px flex-1" />}
                    </div>
                    <div
                      className={cn(
                        "flex flex-col pb-4",
                        idx === ticket.actions.length - 1 && "pb-0",
                      )}
                    >
                      <span className="text-foreground text-xs">{action.description}</span>
                      <span className="text-muted-foreground text-[10px]">
                        {formatDate(action.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: bot } = useSWR<BotConfig>(`/api/bots/${id}`, fetcher);
  const { data: tickets = [] } = useSWR<BotTicket[]>(`/api/bots/${id}/tickets`, fetcher);

  if (!bot) {
    return <BotDetailSkeleton />;
  }

  const doneCount = tickets.filter((t) => t.status === "done").length;
  const activeCount = tickets.filter(
    (t) => t.status === "in_progress" || t.status === "in_review",
  ).length;
  const failedCount = tickets.filter((t) => t.status === "failed").length;
  const totalMessages = tickets.reduce((acc, t) => acc + t.channelMessages.length, 0);
  const totalBranches = tickets.filter((t) => t.branch).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/bots"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Bots
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
              <Bot className="text-primary size-6" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold tracking-tight">{bot.title}</h1>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                <Mail className="size-3" />
                <span>{bot.email}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
          {bot.jobDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border-border bg-card flex items-start gap-3 rounded-lg border px-4 py-3">
          <BrainCircuit className="text-primary mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              AI Model
            </p>
            <p className="text-foreground mt-0.5 text-xs font-medium">
              {bot.defaultModel ?? "Not set"}
            </p>
            {bot.defaultProvider && (
              <p className="text-muted-foreground text-[10px]">{bot.defaultProvider}</p>
            )}
          </div>
        </div>
        <div className="border-border bg-card flex items-start gap-3 rounded-lg border px-4 py-3">
          <Key className="text-chart-2 mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              GitHub Token
            </p>
            <p className="text-foreground mt-0.5 text-xs font-medium">
              {bot.githubToken ? "Configured" : "Not set"}
            </p>
            {bot.githubToken && (
              <p className="text-muted-foreground font-mono text-[10px]">
                {bot.githubToken.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>
        <div className="border-border bg-card flex items-start gap-3 rounded-lg border px-4 py-3">
          <DollarSign className="text-chart-3 mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Spending Limit
            </p>
            <p className="text-foreground mt-0.5 text-xs font-medium">
              {bot.spendingLimit ? `$${bot.spendingLimit}/mo` : "Unlimited"}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3",
            bot.autonomyLevel === "autonomous"
              ? "border-primary/20 bg-primary/5"
              : "border-warning/20 bg-warning/5",
          )}
        >
          {bot.autonomyLevel === "autonomous" ? (
            <Zap className="text-primary mt-0.5 size-4 shrink-0" />
          ) : (
            <Eye className="text-warning mt-0.5 size-4 shrink-0" />
          )}
          <div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Autonomy
            </p>
            <p
              className={cn(
                "mt-0.5 text-xs font-medium",
                bot.autonomyLevel === "autonomous" ? "text-primary" : "text-warning",
              )}
            >
              {bot.autonomyLevel === "autonomous" ? "Autonomous" : "Supervised"}
            </p>
            {bot.autonomyLevel === "supervised" && (
              <div className="mt-1 flex flex-wrap gap-1">
                {bot.supervisedSettings.confirmPrCreation && (
                  <Badge
                    variant="outline"
                    className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                  >
                    PR
                  </Badge>
                )}
                {bot.supervisedSettings.confirmPush && (
                  <Badge
                    variant="outline"
                    className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                  >
                    Push
                  </Badge>
                )}
                {bot.supervisedSettings.confirmJiraComment && (
                  <Badge
                    variant="outline"
                    className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                  >
                    Comment
                  </Badge>
                )}
                {bot.supervisedSettings.confirmSolution && (
                  <Badge
                    variant="outline"
                    className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                  >
                    Solution
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="border-border bg-card rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Total Tickets
          </p>
          <p className="text-foreground mt-1 text-2xl font-semibold">{tickets.length}</p>
        </div>
        <div className="border-border bg-card rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Completed
          </p>
          <p className="text-success mt-1 text-2xl font-semibold">{doneCount}</p>
        </div>
        <div className="border-border bg-card rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Active
          </p>
          <p className="text-warning mt-1 text-2xl font-semibold">{activeCount}</p>
        </div>
        <div className="border-border bg-card rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Messages
          </p>
          <p className="text-chart-1 mt-1 text-2xl font-semibold">{totalMessages}</p>
        </div>
        <div className="border-border bg-card rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Branches
          </p>
          <p className="text-chart-2 mt-1 text-2xl font-semibold">{totalBranches}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-sm font-semibold">Tickets ({tickets.length})</h2>
          {failedCount > 0 && (
            <Badge variant="outline" className="text-destructive border-destructive/25 text-[10px]">
              {failedCount} failed
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} />
          ))}
          {tickets.length === 0 && (
            <div className="border-border flex items-center justify-center rounded-lg border border-dashed py-12">
              <p className="text-muted-foreground text-sm">No tickets assigned to this bot yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
