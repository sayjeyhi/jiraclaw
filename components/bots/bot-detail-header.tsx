import Link from "next/link";
import { Bot, Mail, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BotConfig } from "@/lib/types";

interface BotDetailHeaderProps {
  bot: BotConfig;
  workspaceId: string;
}

export function BotDetailHeader({ bot, workspaceId }: BotDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
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
        <Button variant="outline" size="sm" asChild>
          <Link href={`/w/${workspaceId}/bots/${bot.id}/edit`}>
            <Pencil className="mr-2 size-4" />
            Edit
          </Link>
        </Button>
      </div>
      {bot.botSkillDescription && (
        <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
          {bot.botSkillDescription}
        </p>
      )}
    </div>
  );
}
