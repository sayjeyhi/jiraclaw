import { BrainCircuit, Key, DollarSign, Zap, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BotConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BotDetailStatsProps {
  bot: BotConfig;
}

export function BotDetailStats({ bot }: BotDetailStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="border-border bg-card flex items-start gap-3 rounded-lg border px-4 py-3">
        <BrainCircuit className="text-primary mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            AI Model
          </p>
          <p className="text-foreground mt-0.5 text-xs font-medium">
            {bot.defaultModel ?? "Not set"}
          </p>
          {bot.defaultProvider && (
            <p className="text-muted-foreground text-[10px]">{bot.defaultProvider}</p>
          )}
        </div>
      </div>
      <div className="border-border bg-card flex items-start gap-3 rounded-lg border px-4 py-3">
        <Key className="text-chart-2 mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            GitHub Token
          </p>
          <p className="text-foreground mt-0.5 text-xs font-medium">
            {bot.githubToken ? "Configured" : "Not set"}
          </p>
          {bot.githubToken && (
            <p className="text-muted-foreground font-mono text-[10px]">
              {bot.githubToken.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
      <div className="border-border bg-card flex items-start gap-3 rounded-lg border px-4 py-3">
        <DollarSign className="text-chart-3 mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Spending Limit
          </p>
          <p className="text-foreground mt-0.5 text-xs font-medium">
            {bot.spendingLimit ? `$${bot.spendingLimit}/mo` : "Unlimited"}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border px-4 py-3",
          bot.autonomyLevel === "autonomous"
            ? "border-primary/20 bg-primary/5"
            : "border-warning/20 bg-warning/5",
        )}
      >
        {bot.autonomyLevel === "autonomous" ? (
          <Zap className="text-primary mt-0.5 size-4 shrink-0" />
        ) : (
          <Eye className="text-warning mt-0.5 size-4 shrink-0" />
        )}
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Autonomy
          </p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              bot.autonomyLevel === "autonomous" ? "text-primary" : "text-warning",
            )}
          >
            {bot.autonomyLevel === "autonomous" ? "Autonomous" : "Supervised"}
          </p>
          {bot.autonomyLevel === "supervised" && (
            <div className="mt-1 flex flex-wrap gap-1">
              {bot.supervisedSettings.allowPrCreation && (
                <Badge
                  variant="outline"
                  className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                >
                  PR
                </Badge>
              )}
              {bot.supervisedSettings.allowPush && (
                <Badge
                  variant="outline"
                  className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                >
                  Push
                </Badge>
              )}
              {bot.supervisedSettings.allowJiraComment && (
                <Badge
                  variant="outline"
                  className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                >
                  Comment
                </Badge>
              )}
              {bot.supervisedSettings.confirmSolutionBeforeStart && (
                <Badge
                  variant="outline"
                  className="text-warning border-warning/25 px-1 py-0 text-[9px]"
                >
                  Solution
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
