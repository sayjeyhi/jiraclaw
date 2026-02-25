"use client"

import { Globe, MoreVertical, Pencil, Trash2, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SystemPrompt } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface PromptCardProps {
  prompt: SystemPrompt
  onEdit: (prompt: SystemPrompt) => void
  onDelete: (id: string) => void
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const overrideCount = Object.keys(prompt.botOverrides).length

  return (
    <div className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-card-foreground">{prompt.name}</h3>
          {prompt.isGlobal ? (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/25">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground opacity-0 group-hover:opacity-100">
              <MoreVertical className="size-4" />
              <span className="sr-only">Prompt actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(prompt)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(prompt.id)}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {prompt.content}
      </p>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
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
  )
}
