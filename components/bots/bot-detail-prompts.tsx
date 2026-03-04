"use client";

import { FileText, Globe, User } from "lucide-react";
import type { BotConfig, SystemPrompt } from "@/lib/types";

interface BotDetailPromptsProps {
  bot: BotConfig;
  prompts: SystemPrompt[];
}

export function BotDetailPrompts({ bot, prompts }: BotDetailPromptsProps) {
  const globalPromptId = bot.globalPromptId ?? "";
  const systemPromptId = bot.systemPromptId ?? "";
  const globalPrompt = globalPromptId ? prompts.find((p) => p.id === globalPromptId) : null;
  const localPrompt = systemPromptId ? prompts.find((p) => p.id === systemPromptId) : null;
  const hasAny = globalPrompt || localPrompt;

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <FileText className="text-primary size-4" />
        <h3 className="text-sm font-medium">Prompts</h3>
      </div>

      {!hasAny ? (
        <div className="border-border bg-muted/30 flex flex-col gap-2 rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground text-sm">No custom prompt selected</p>
          <p className="text-muted-foreground text-xs">
            This bot uses the default system prompt. Edit the bot to assign a global or local
            prompt.
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          {globalPrompt && (
            <div className="border-border bg-muted/20 hover:border-primary/30 group flex w-1/2 flex-col gap-1 rounded-lg border p-2 transition-colors">
              <div className="flex items-center gap-2">
                <h4 className="text-card-foreground text-xs font-medium">{globalPrompt.name}</h4>
                <span className="text-primary border-primary/25 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px]">
                  <Globe className="size-2.5" />
                  Global
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                {globalPrompt.content}
              </p>
            </div>
          )}
          {localPrompt && (
            <div className="border-border bg-muted/20 hover:border-primary/30 group flex w-1/2 flex-col gap-1 rounded-lg border p-2 transition-colors">
              <div className="flex items-center gap-2">
                <h4 className="text-card-foreground text-xs font-medium">{localPrompt.name}</h4>
                <span className="text-muted-foreground flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px]">
                  <User className="size-2.5" />
                  Local
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                {localPrompt.content}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
