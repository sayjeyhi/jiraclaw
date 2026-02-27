"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  ExternalLink,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ticketStatusConfig, priorityConfig, actionIcon } from "./bot-detail-config";
import type { BotTicket, TicketAction } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BotTicketRowProps {
  ticket: BotTicket;
  defaultExpanded?: boolean;
}

export function BotTicketRow({ ticket, defaultExpanded = false }: BotTicketRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
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
