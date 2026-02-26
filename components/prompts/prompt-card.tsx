"use client";

import { Globe, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SystemPrompt } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PromptCardProps {
  prompt: SystemPrompt;
  onEdit: (prompt: SystemPrompt) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const overrideCount = Object.keys(prompt.botOverrides).length;

  return (
    <div className="group border-border bg-card hover:border-primary/30 flex flex-col gap-3 rounded-lg border p-5 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-card-foreground text-sm font-semibold">{prompt.name}</h3>
          {prompt.isGlobal ? (
            <Badge variant="outline" className="text-primary border-primary/25 text-[10px]">
              <Globe className="mr-1 size-2.5" />
              Global
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              <User className="mr-1 size-2.5" />
              Bot-specific
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-6"
            onClick={() => onEdit(prompt)}
          >
            <Pencil className="size-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-6"
            onClick={() => onDelete(prompt.id)}
          >
            <Trash2 className="size-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{prompt.content}</p>

      <div className="border-border text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
        <div className="flex items-center gap-3">
          {overrideCount > 0 && (
            <span>
              {overrideCount} bot override{overrideCount !== 1 ? "s" : ""}
            </span>
          )}
          <span>Updated {formatDate(prompt.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
