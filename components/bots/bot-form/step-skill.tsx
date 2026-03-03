"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SkillsCardPicker } from "@/components/bots/skills-card-picker";
import { PromptDialog } from "@/components/prompts/prompt-dialog";
import type { FormState, FieldErrors } from "./types";
import type { SystemPrompt } from "@/lib/types";
import type { PromptSaveData } from "@/components/prompts/prompt-dialog";

interface BotOption {
  id: string;
  title: string;
  systemPromptId?: string | null;
}

interface StepSkillProps {
  form: FormState;
  errors: FieldErrors;
  prompts: SystemPrompt[];
  bots?: BotOption[];
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onClearError: (field: string) => void;
  onCreatePrompt?: (data: PromptSaveData) => Promise<void>;
  onPromptsChange?: () => void;
}

const MAX_SKILLS = parseInt(process.env.MAX_SKILLS_PER_BOT!, 10) || 5;

export function StepSkill({
  form,
  errors,
  prompts,
  bots = [],
  onFormChange,
  onClearError,
  onCreatePrompt,
  onPromptsChange = () => {},
}: StepSkillProps) {
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);

  const globalPrompts = prompts.filter((p) => p.isGlobal);
  const localPrompts = prompts.filter((p) => !p.isGlobal);

  const handleCreatePrompt = async (data: PromptSaveData) => {
    if (onCreatePrompt) {
      await onCreatePrompt(data);
      onPromptsChange();
      setPromptDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Skills section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            Skills
            {form.skills.length > 0 && (
              <p className="text-muted-foreground/60 text-[10px]">
                ({form.skills.length}/{MAX_SKILLS} selected)
              </p>
            )}
          </h3>

          <p className="text-muted-foreground text-[10px]">
            Select up to {MAX_SKILLS} skills from{" "}
            <a
              href="https://skills.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              skills.sh
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <SkillsCardPicker
            value={form.skills}
            onChange={(skills) => {
              onFormChange((prev) => ({ ...prev, skills }));
              onClearError("skills");
            }}
            error={errors.skills}
          />
        </div>
      </section>

      {/* Prompts section */}
      <section className="border-border flex flex-col gap-4 border-t pt-6">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Prompts
        </h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="global-prompt">Global prompt</Label>
            <Select
              value={form.selectedGlobalPromptId || "__none__"}
              onValueChange={(v) =>
                onFormChange((prev) => ({
                  ...prev,
                  selectedGlobalPromptId: v === "__none__" ? "" : v,
                }))
              }
            >
              <SelectTrigger id="global-prompt">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {globalPrompts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-[10px]">Base prompt applied across bots</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="local-prompt">Local prompt</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPromptDialogOpen(true)}
              >
                <Plus className="mr-1.5 size-3.5" />
                Add System Prompt
              </Button>
            </div>
            <Select
              value={form.selectedSystemPromptId || "__none__"}
              onValueChange={(v) =>
                onFormChange((prev) => ({
                  ...prev,
                  selectedSystemPromptId: v === "__none__" ? "" : v,
                }))
              }
            >
              <SelectTrigger id="local-prompt">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {localPrompts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-[10px]">
              Bot-specific override (takes precedence over global)
            </p>
          </div>
        </div>
      </section>

      {onCreatePrompt && (
        <PromptDialog
          open={promptDialogOpen}
          onOpenChange={setPromptDialogOpen}
          prompt={null}
          bots={bots}
          onSave={handleCreatePrompt}
        />
      )}
    </div>
  );
}
