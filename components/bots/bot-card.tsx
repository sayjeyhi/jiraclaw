"use client"

import Link from "next/link"
import {
  Bot,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  XCircle,
  Zap,
  Eye,
  DollarSign,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BotConfig, BotTicket } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BotCardProps {
  bot: BotConfig
  tickets: BotTicket[]
  onEdit: (bot: BotConfig) => void
  onDelete: (id: string) => void
}

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/25" },
  working: { label: "Working", className: "bg-primary/15 text-primary border-primary/25" },
  idle: { label: "Idle", className: "bg-muted text-muted-foreground border-border" },
  error: { label: "Error", className: "bg-destructive/15 text-destructive border-destructive/25" },
}

const ticketStatusIcon: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="size-3.5 text-success" />,
  in_review: <Search className="size-3.5 text-chart-1" />,
  in_progress: <Loader2 className="size-3.5 text-warning" />,
  open: <Circle className="size-3.5 text-muted-foreground" />,
  failed: <XCircle className="size-3.5 text-destructive" />,
}

const priorityColor: Record<string, string> = {
  critical: "text-destructive",
  high: "text-warning",
  medium: "text-chart-1",
  low: "text-muted-foreground",
}

export function BotCard({ bot, tickets, onEdit, onDelete }: BotCardProps) {
  const status = statusConfig[bot.status]
  const recentTickets = tickets.slice(0, 3)

  return (
    <div className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              {bot.title}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3" />
              <span>{bot.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] font-medium", status.className)}>
            <span className={cn(
              "mr-1 inline-block size-1.5 rounded-full",
              bot.status === "active" && "bg-success",
              bot.status === "working" && "bg-primary animate-pulse",
              bot.status === "idle" && "bg-muted-foreground",
              bot.status === "error" && "bg-destructive",
            )} />
            {status.label}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Bot actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(bot) }}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(bot.id) }}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {bot.jobDescription}
      </p>

      {recentTickets.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent Tickets
          </span>
          <div className="flex flex-col gap-1.5">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5"
              >
                {ticketStatusIcon[ticket.status]}
                <span className={cn("shrink-0 text-[10px] font-semibold", priorityColor[ticket.priority])}>
                  {ticket.key}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {ticket.summary}
                </span>
                {ticket.branch && (
                  <GitBranch className="ml-auto size-3 shrink-0 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {bot.defaultModel && (
          <Badge variant="secondary" className="text-[10px] gap-1">
            {bot.defaultProvider}/{bot.defaultModel}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] gap-1",
            bot.autonomyLevel === "autonomous"
              ? "text-primary border-primary/25"
              : "text-warning border-warning/25"
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
          <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
            <DollarSign className="size-2.5" />
            {bot.spendingLimit}/mo
          </Badge>
        )}
        {bot.githubToken && (
          <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
            <GitBranch className="size-2.5" />
            Token set
          </Badge>
        )}
        <Link
          href={`/bots/${bot.id}`}
          className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
