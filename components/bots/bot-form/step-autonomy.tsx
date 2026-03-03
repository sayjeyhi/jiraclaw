"use client";

import { Eye, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FormState, FieldErrors } from "./types";
import type { SupervisedSettings } from "@/lib/types";

interface StepAutonomyProps {
  form: FormState;
  errors: FieldErrors;
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onToggleSupervisedSetting: (key: keyof SupervisedSettings) => void;
  onClearError: (field: string) => void;
}

export function StepAutonomy({
  form,
  errors,
  onFormChange,
  onToggleSupervisedSetting,
  onClearError,
}: StepAutonomyProps) {
  return (
    <>
      <div className="flex flex-col gap-4">
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
          {errors.title && <p className="text-destructive text-[10px]">{errors.title}</p>}
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
            <p className="text-destructive text-[10px]">{errors.email}</p>
          ) : (
            <p className="text-muted-foreground -mt-1 text-[10px]">
              Used for Jira assignment detection
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the bot's role, responsibilities, and behavior..."
            rows={3}
            value={form.botSkillDescription}
            onChange={(e) => {
              onFormChange((prev) => ({ ...prev, botSkillDescription: e.target.value }));
              onClearError("skills");
              onClearError("botSkillDescription");
            }}
            className="min-h-20"
          />
          <p className="text-muted-foreground text-[10px]">
            Optional. What the bot is responsible for?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onFormChange((prev) => ({ ...prev, autonomyLevel: "supervised" }))}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-4 transition-all",
            form.autonomyLevel === "supervised"
              ? "border-warning bg-warning/5"
              : "border-border hover:border-muted-foreground/30",
          )}
        >
          <Eye
            className={cn(
              "size-5",
              form.autonomyLevel === "supervised" ? "text-warning" : "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              form.autonomyLevel === "supervised" ? "text-warning" : "text-muted-foreground",
            )}
          >
            Supervised
          </span>
          <span className="text-muted-foreground text-center text-[10px] leading-relaxed">
            Bot confirms actions before executing
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFormChange((prev) => ({ ...prev, autonomyLevel: "autonomous" }))}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-4 transition-all",
            form.autonomyLevel === "autonomous"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30",
          )}
        >
          <Zap
            className={cn(
              "size-5",
              form.autonomyLevel === "autonomous" ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              form.autonomyLevel === "autonomous" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Autonomous
          </span>
          <span className="text-muted-foreground text-center text-[10px] leading-relaxed">
            Bot acts independently without confirmation
          </span>
        </button>
      </div>

      {form.autonomyLevel === "supervised" && (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-muted-foreground text-[10px] leading-relaxed">
            The bot will confirm actions via channels before doing the activity
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              {
                key: "confirmSolutionBeforeStart" as const,
                label: "Confirm Provided Solution Before start",
              },
              { key: "allowPrCreation" as const, label: "Allow PR creation" },
              { key: "allowPush" as const, label: "Allow Push" },
              { key: "allowIssueTransition" as const, label: "Allow Jira Transition" },
              { key: "allowJiraComment" as const, label: "Allow Jira Comment" },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2.5">
                <Checkbox
                  checked={form.supervisedSettings[key]}
                  onCheckedChange={() => onToggleSupervisedSetting(key)}
                />
                <span className="text-foreground text-xs">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
