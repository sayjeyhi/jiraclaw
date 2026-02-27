import type { BotTicket } from "@/lib/types";

interface BotDetailSummaryProps {
  tickets: BotTicket[];
}

export function BotDetailSummary({ tickets }: BotDetailSummaryProps) {
  const doneCount = tickets.filter((t) => t.status === "done").length;
  const activeCount = tickets.filter(
    (t) => t.status === "in_progress" || t.status === "in_review",
  ).length;
  const totalMessages = tickets.reduce((acc, t) => acc + t.channelMessages.length, 0);
  const totalBranches = tickets.filter((t) => t.branch).length;

  return (
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
  );
}
