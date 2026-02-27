"use client";

import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BotConfig } from "@/lib/types";

const SKILLS_URL = "https://skills.sh";

interface BotDetailSkillsProps {
  bot: BotConfig;
  workspaceId: string;
}

export function BotDetailSkills({ bot, workspaceId }: BotDetailSkillsProps) {
  const skills = bot.skills ?? [];

  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary size-4" />
        <h3 className="text-sm font-medium">Skills</h3>
        <a
          href={SKILLS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1 text-xs"
        >
          From skills.sh
          <ExternalLink className="size-3" />
        </a>
      </div>
      {skills.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No skills added.{" "}
          <Link
            href={`/w/${workspaceId}/bots/${bot.id}/edit`}
            className="text-primary hover:underline"
          >
            Edit bot
          </Link>{" "}
          to add skills from skills.sh.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((id) => {
            const parts = id.split("/");
            const name = parts[parts.length - 1] ?? id;
            const repo = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : id;
            const skillUrl = `${SKILLS_URL}/${id}`;
            return (
              <Badge key={id} variant="secondary" className="font-normal" asChild>
                <Link
                  href={skillUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-secondary/80 flex items-center gap-1 transition-colors"
                >
                  <span>{name}</span>
                  <span className="text-muted-foreground text-[10px]">{repo}</span>
                  <ExternalLink className="size-3 opacity-60" />
                </Link>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
