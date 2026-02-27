"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkillsPicker } from "@/components/bots/skills-picker";
import type { FormState, FieldErrors } from "./types";

interface StepSkillProps {
  form: FormState;
  errors: FieldErrors;
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onClearError: (field: string) => void;
}

export function StepSkill({ form, errors, onFormChange, onClearError }: StepSkillProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the bot's role, responsibilities, and behavior..."
          rows={4}
          value={form.botSkillDescription}
          onChange={(e) => {
            onFormChange((prev) => ({ ...prev, botSkillDescription: e.target.value }));
            onClearError("skills");
            onClearError("botSkillDescription");
          }}
          className="min-h-[100px]"
        />
        <p className="text-muted-foreground text-[11px]">
          Optional. Add at least one skill below or a description (min 20 characters).
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Skills from skills.sh</Label>
        <SkillsPicker
          value={form.skills}
          onChange={(skills) => {
            onFormChange((prev) => ({ ...prev, skills }));
            onClearError("skills");
          }}
          error={errors.skills}
        />
      </div>
    </>
  );
}
