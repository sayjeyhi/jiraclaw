"use client";

import Link from "next/link";
import { FileText, Globe, User } from "lucide-react";
import type { BotConfig, SystemPrompt } from "@/lib/types";

interface BotDetailPromptsProps {
  bot: BotConfig;
  prompts: SystemPrompt[];
}

export function BotDetailPrompts({ bot, prompts }: BotDetailPromptsProps) {
  const systemPromptId = bot.systemPromptId ?? "";
  const prompt = systemPromptId ? prompts.find((p) => p.id === systemPromptId) : null;

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <FileText className="text-primary size-4" />
        <h3 className="text-sm font-medium">Prompts</h3>
      </div>

      {!prompt ? (
        <div className="border-border bg-muted/30 flex flex-col gap-2 rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground text-sm">No custom prompt selected</p>
          <p className="text-muted-foreground text-xs">
            This bot uses the default system prompt. Edit the bot to assign a global or local
            prompt.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="border-border bg-muted/20 hover:border-primary/30 group flex flex-col gap-2 rounded-lg border p-4 transition-colors">
            <div className="flex items-center gap-2">
              <h4 className="text-card-foreground text-sm font-medium">{prompt.name}</h4>
              {prompt.isGlobal ? (
                <span className="text-primary border-primary/25 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]">
                  <Globe className="size-2.5" />
                  Global
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]">
                  <User className="size-2.5" />
                  Local
                </span>
              )}
            </div>
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
              {prompt.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
