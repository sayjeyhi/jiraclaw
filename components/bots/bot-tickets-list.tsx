import { BotTicketRow } from "./bot-ticket-row";
import type { BotTicket } from "@/lib/types";

interface BotTicketsListProps {
  tickets: BotTicket[];
  expandedTicketId?: string | null;
}

export function BotTicketsList({ tickets, expandedTicketId }: BotTicketsListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {tickets.map((ticket) => (
          <BotTicketRow
            key={ticket.id}
            ticket={ticket}
            defaultExpanded={expandedTicketId === ticket.id}
          />
        ))}
        {tickets.length === 0 && (
          <div className="border-border flex items-center justify-center rounded-lg border border-dashed py-12">
            <p className="text-muted-foreground text-sm">No tickets assigned to this bot yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
