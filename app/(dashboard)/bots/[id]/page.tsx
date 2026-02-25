"use client"

import { use, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BotDetailSkeleton } from "@/components/loading-skeletons"
import { fetcher } from "@/lib/api"
import type { BotConfig, BotTicket, TicketAction } from "@/lib/types"
import { cn, formatDate } from "@/lib/utils"

const ticketStatusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  done: { label: "Done", icon: <CheckCircle2 className="size-4" />, className: "bg-success/15 text-success border-success/25" },
  in_review: { label: "In Review", icon: <Search className="size-4" />, className: "bg-chart-1/15 text-chart-1 border-chart-1/25" },
  in_progress: { label: "In Progress", icon: <Loader2 className="size-4" />, className: "bg-warning/15 text-warning border-warning/25" },
  open: { label: "Open", icon: <Circle className="size-4" />, className: "bg-muted text-muted-foreground border-border" },
  failed: { label: "Failed", icon: <XCircle className="size-4" />, className: "bg-destructive/15 text-destructive border-destructive/25" },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/15 text-destructive border-destructive/25" },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/25" },
  medium: { label: "Medium", className: "bg-chart-1/15 text-chart-1 border-chart-1/25" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
}

const actionIcon: Record<string, React.ReactNode> = {
  branch_created: <GitBranch className="size-3.5 text-chart-2" />,
  pr_opened: <ExternalLink className="size-3.5 text-chart-1" />,
  comment_added: <MessageSquare className="size-3.5 text-muted-foreground" />,
  status_changed: <Circle className="size-3.5 text-warning" />,
  message_sent: <Hash className="size-3.5 text-chart-1" />,
  review_submitted: <Search className="size-3.5 text-chart-4" />,
  merged: <CheckCircle2 className="size-3.5 text-success" />,
}

function TicketRow({ ticket }: { ticket: BotTicket }) {
  const [expanded, setExpanded] = useState(false)
  const status = ticketStatusConfig[ticket.status]
  const priority = priorityConfig[ticket.priority]

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="shrink-0 text-xs font-semibold text-foreground">{ticket.key}</span>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{ticket.summary}</span>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", status.className)}>
          {status.icon}
          <span className="ml-1">{status.label}</span>
        </Badge>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", priority.className)}>
          {priority.label}
        </Badge>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-3 lg:col-span-1">
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Details</h4>
              <div className="flex flex-col gap-2 text-xs">
                {ticket.branch && (
                  <div className="flex items-center gap-2">
                    <GitBranch className="size-3.5 text-muted-foreground" />
                    <span className="text-foreground">{ticket.branch}</span>
                  </div>
                )}
                {ticket.repoName && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                    <span className="text-foreground">{ticket.repoName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Circle className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Assigned {formatDate(ticket.assignedAt)}</span>
                </div>
                {ticket.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-success" />
                    <span className="text-muted-foreground">Completed {formatDate(ticket.completedAt)}</span>
                  </div>
                )}
              </div>
              {ticket.channelMessages.length > 0 && (
                <div className="flex flex-col gap-2 pt-2">
                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Messages Sent ({ticket.channelMessages.length})
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {ticket.channelMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-2 rounded-md bg-muted/50 px-2.5 py-2">
                        <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">{msg.channel}</Badge>
                        <span className="min-w-0 flex-1 text-[11px] leading-relaxed text-muted-foreground">{msg.message}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[9px]",
                            msg.status === "delivered" && "text-success border-success/25",
                            msg.status === "failed" && "text-destructive border-destructive/25",
                            msg.status === "pending" && "text-warning border-warning/25"
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
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Activity Timeline ({ticket.actions.length} events)
              </h4>
              <div className="relative flex flex-col gap-0">
                {ticket.actions.map((action: TicketAction, idx: number) => (
                  <div key={action.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex size-7 items-center justify-center rounded-full border border-border bg-muted">
                        {actionIcon[action.type] ?? <Circle className="size-3.5 text-muted-foreground" />}
                      </div>
                      {idx < ticket.actions.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className={cn("flex flex-col pb-4", idx === ticket.actions.length - 1 && "pb-0")}>
                      <span className="text-xs text-foreground">{action.description}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(action.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: bot } = useSWR<BotConfig>(`/api/bots/${id}`, fetcher)
  const { data: tickets = [] } = useSWR<BotTicket[]>(`/api/bots/${id}/tickets`, fetcher)

  if (!bot) {
    return <BotDetailSkeleton />
  }

  const doneCount = tickets.filter((t) => t.status === "done").length
  const activeCount = tickets.filter((t) => t.status === "in_progress" || t.status === "in_review").length
  const failedCount = tickets.filter((t) => t.status === "failed").length
  const totalMessages = tickets.reduce((acc, t) => acc + t.channelMessages.length, 0)
  const totalBranches = tickets.filter((t) => t.branch).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link href="/bots" className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Back to Bots
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{bot.title}</h1>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3" />
                <span>{bot.email}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{bot.jobDescription}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <BrainCircuit className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">AI Model</p>
            <p className="mt-0.5 text-xs font-medium text-foreground">{bot.defaultModel ?? "Not set"}</p>
            {bot.defaultProvider && <p className="text-[10px] text-muted-foreground">{bot.defaultProvider}</p>}
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Key className="mt-0.5 size-4 shrink-0 text-chart-2" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">GitHub Token</p>
            <p className="mt-0.5 text-xs font-medium text-foreground">{bot.githubToken ? "Configured" : "Not set"}</p>
            {bot.githubToken && <p className="text-[10px] text-muted-foreground font-mono">{bot.githubToken.slice(0, 8)}...</p>}
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <DollarSign className="mt-0.5 size-4 shrink-0 text-chart-3" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Spending Limit</p>
            <p className="mt-0.5 text-xs font-medium text-foreground">{bot.spendingLimit ? `$${bot.spendingLimit}/mo` : "Unlimited"}</p>
          </div>
        </div>
        <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", bot.autonomyLevel === "autonomous" ? "border-primary/20 bg-primary/5" : "border-warning/20 bg-warning/5")}>
          {bot.autonomyLevel === "autonomous" ? <Zap className="mt-0.5 size-4 shrink-0 text-primary" /> : <Eye className="mt-0.5 size-4 shrink-0 text-warning" />}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Autonomy</p>
            <p className={cn("mt-0.5 text-xs font-medium", bot.autonomyLevel === "autonomous" ? "text-primary" : "text-warning")}>
              {bot.autonomyLevel === "autonomous" ? "Autonomous" : "Supervised"}
            </p>
            {bot.autonomyLevel === "supervised" && (
              <div className="mt-1 flex flex-wrap gap-1">
                {bot.supervisedSettings.confirmPrCreation && <Badge variant="outline" className="text-[9px] px-1 py-0 text-warning border-warning/25">PR</Badge>}
                {bot.supervisedSettings.confirmPush && <Badge variant="outline" className="text-[9px] px-1 py-0 text-warning border-warning/25">Push</Badge>}
                {bot.supervisedSettings.confirmJiraComment && <Badge variant="outline" className="text-[9px] px-1 py-0 text-warning border-warning/25">Comment</Badge>}
                {bot.supervisedSettings.confirmSolution && <Badge variant="outline" className="text-[9px] px-1 py-0 text-warning border-warning/25">Solution</Badge>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Tickets</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{tickets.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-success">{doneCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-semibold text-warning">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Messages</p>
          <p className="mt-1 text-2xl font-semibold text-chart-1">{totalMessages}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Branches</p>
          <p className="mt-1 text-2xl font-semibold text-chart-2">{totalBranches}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Tickets ({tickets.length})</h2>
          {failedCount > 0 && (
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/25">{failedCount} failed</Badge>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} />
          ))}
          {tickets.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-12">
              <p className="text-sm text-muted-foreground">No tickets assigned to this bot yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
