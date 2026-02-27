import {
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  XCircle,
  GitBranch,
  MessageSquare,
  ExternalLink,
  Hash,
} from "lucide-react";

export const ticketStatusConfig: Record<
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

export const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-destructive/15 text-destructive border-destructive/25",
  },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/25" },
  medium: { label: "Medium", className: "bg-chart-1/15 text-chart-1 border-chart-1/25" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

export const actionIcon: Record<string, React.ReactNode> = {
  branch_created: <GitBranch className="text-chart-2 size-3.5" />,
  pr_opened: <ExternalLink className="text-chart-1 size-3.5" />,
  comment_added: <MessageSquare className="text-muted-foreground size-3.5" />,
  status_changed: <Circle className="text-warning size-3.5" />,
  message_sent: <Hash className="text-chart-1 size-3.5" />,
  review_submitted: <Search className="text-chart-4 size-3.5" />,
  merged: <CheckCircle2 className="text-success size-3.5" />,
};
