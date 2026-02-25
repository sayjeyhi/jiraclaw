"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { SystemPrompt } from "@/lib/types"

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt?: SystemPrompt | null
  onSave: (data: Pick<SystemPrompt, "name" | "content" | "isGlobal">) => void
}

export function PromptDialog({ open, onOpenChange, prompt, onSave }: PromptDialogProps) {
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [isGlobal, setIsGlobal] = useState(false)

  useEffect(() => {
    if (prompt) {
      setName(prompt.name)
      setContent(prompt.content)
      setIsGlobal(prompt.isGlobal)
    } else {
      setName("")
      setContent("")
      setIsGlobal(false)
    }
  }, [prompt, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, content, isGlobal })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{prompt ? "Edit Prompt" : "Create Prompt"}</DialogTitle>
            <DialogDescription>
              Define a reusable system prompt for your AI bots.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="promptName">Name</Label>
              <Input
                id="promptName"
                placeholder="e.g. Code Review Expert"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="promptContent">Prompt Content</Label>
              <Textarea
                id="promptContent"
                placeholder="You are an expert..."
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <Label htmlFor="isGlobal" className="text-sm font-medium">Global Prompt</Label>
                <p className="text-xs text-muted-foreground">
                  Apply this prompt as a base for all bots
                </p>
              </div>
              <Switch
                id="isGlobal"
                checked={isGlobal}
                onCheckedChange={setIsGlobal}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {prompt ? "Save Changes" : "Create Prompt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
