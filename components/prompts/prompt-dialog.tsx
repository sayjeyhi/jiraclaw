"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import type { SystemPrompt } from "@/lib/types";

interface BotOption {
  id: string;
  title: string;
  globalPromptId?: string | null;
  systemPromptId?: string | null;
}

export interface PromptSaveData {
  name: string;
  content: string;
  isGlobal: boolean;
  botIds?: string[];
}

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: SystemPrompt | null;
  bots: BotOption[];
  onSave: (data: PromptSaveData) => void;
  /** When set, forces prompt type and hides the selector. Bot prompts created this way have no bot IDs (assign later in Settings). */
  isGlobal?: boolean;
}

export function PromptDialog({
  open,
  onOpenChange,
  prompt,
  bots,
  onSave,
  isGlobal: isGlobalForced,
}: PromptDialogProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);

  const showIsGlobalSelector = isGlobalForced === undefined;
  const effectiveIsGlobal = isGlobalForced ?? isGlobal;

  useEffect(() => {
    if (prompt) {
      setName(prompt.name);
      setContent(prompt.content);
      setIsGlobal(prompt.isGlobal);
      const ids = bots
        .filter(
          (b) =>
            (prompt.isGlobal && b.globalPromptId === prompt.id) ||
            (!prompt.isGlobal && b.systemPromptId === prompt.id),
        )
        .map((b) => b.id);
      setSelectedBotIds(ids);
    } else {
      setName("");
      setContent("");
      setIsGlobal(isGlobalForced ?? true);
      setSelectedBotIds([]);
    }
  }, [prompt, bots, open, isGlobalForced]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const useIsGlobal = showIsGlobalSelector ? isGlobal : (isGlobalForced ?? true);
    onSave({
      name,
      content,
      isGlobal: useIsGlobal,
      ...(useIsGlobal ? {} : { botIds: showIsGlobalSelector ? selectedBotIds : [] }),
    });
    onOpenChange(false);
  };

  const toggleBot = (botId: string) => {
    setSelectedBotIds((prev) =>
      prev.includes(botId) ? prev.filter((id) => id !== botId) : [...prev, botId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {prompt
                ? "Edit Prompt"
                : isGlobalForced !== undefined
                  ? isGlobalForced
                    ? "Create Global Prompt"
                    : "Create Bot Prompt"
                  : "Create Prompt"}
            </DialogTitle>
            <DialogDescription>Define a reusable system prompt for your AI bots.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="promptName">Name</Label>
              <Input
                id="promptName"
                placeholder="e.g. Expert In Software Development"
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
                className="min-h-40 font-mono text-xs"
                required
              />
            </div>

            {showIsGlobalSelector && (
              <div className="border-border flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <Label htmlFor="isGlobal" className="text-sm font-medium">
                    Global Prompt
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Apply this prompt as a base for all bots
                  </p>
                </div>
                <Switch id="isGlobal" checked={isGlobal} onCheckedChange={setIsGlobal} />
              </div>
            )}

            {!effectiveIsGlobal && showIsGlobalSelector && (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Assign to bots</Label>
                <p className="text-muted-foreground text-xs">
                  Select which bots should use this prompt
                </p>
                {bots.length === 0 ? (
                  <p className="text-muted-foreground rounded-md border border-dashed px-3 py-4 text-center text-sm">
                    No bots in this workspace. Create a bot first.
                  </p>
                ) : (
                  <div className="border-border max-h-40 overflow-y-auto rounded-md border p-2">
                    <div className="flex flex-col gap-2">
                      {bots.map((bot) => (
                        <label
                          key={bot.id}
                          className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
                        >
                          <Checkbox
                            checked={selectedBotIds.includes(bot.id)}
                            onCheckedChange={() => toggleBot(bot.id)}
                          />
                          <span className="text-sm">{bot.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{prompt ? "Save Changes" : "Create Prompt"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
