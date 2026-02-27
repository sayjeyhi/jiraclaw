"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FormState, FieldErrors } from "./types";
import type { SystemPrompt } from "@/lib/types";

interface StepIdentityProps {
  form: FormState;
  errors: FieldErrors;
  prompts: SystemPrompt[];
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onClearError: (field: string) => void;
}

export function StepIdentity({
  form,
  errors,
  prompts,
  onFormChange,
  onClearError,
}: StepIdentityProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Backend, Frontend, DevOps Bot"
          value={form.title}
          onChange={(e) => {
            onFormChange((prev) => ({ ...prev, title: e.target.value }));
            onClearError("title");
          }}
          aria-invalid={!!errors.title}
          className={cn(errors.title && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.title && <p className="text-destructive text-[11px]">{errors.title}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="bot@jiraclaw.ai"
          value={form.email}
          onChange={(e) => {
            onFormChange((prev) => ({ ...prev, email: e.target.value }));
            onClearError("email");
          }}
          aria-invalid={!!errors.email}
          className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.email ? (
          <p className="text-destructive text-[11px]">{errors.email}</p>
        ) : (
          <p className="text-muted-foreground -mt-1 text-[9px]">
            Used for Jira assignment detection
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="system-prompt">System Prompt</Label>
        <Select
          value={form.selectedSystemPromptId}
          onValueChange={(v) => onFormChange((prev) => ({ ...prev, selectedSystemPromptId: v }))}
        >
          <SelectTrigger id="system-prompt">
            <SelectValue placeholder="None (use default)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="N/A">None (use default)</SelectItem>
            {prompts.map((p) => (
              <SelectItem key={p.id} value={p.id || "N/A"}>
                {p.isGlobal ? `${p.name} (global)` : p.name || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-[11px]">
          Optional. Override the default system prompt for this bot.
        </p>
      </div>
    </>
  );
}
