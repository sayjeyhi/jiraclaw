"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BotConfig, AIProvider, SupervisedSettings } from "@/lib/types";
import { Eye, Zap, Bot, Cpu, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot?: BotConfig | null;
  providers: AIProvider[];
  onSave: (data: Omit<BotConfig, "id" | "createdAt" | "status">) => void;
}

const defaultSupervisedSettings: SupervisedSettings = {
  confirmSolutionBeforeStart: false,
  allowPrCreation: true,
  allowPush: false,
  allowJiraComment: true,
  allowIssueTransition: true,
};

const STEPS = [
  { id: 1, label: "Autonomy", icon: ShieldCheck, optional: false },
  { id: 2, label: "Identity", icon: Bot, optional: false },
  { id: 3, label: "AI Model", icon: Cpu, optional: true },
  { id: 4, label: "Credentials", icon: KeyRound, optional: true },
] as const;

// ── Zod schemas ──────────────────────────────────────────────────────────────

const stepAutonomySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
});

const step1Schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
  botSkillDescription: z
    .string()
    .min(20, "Bot Skills is required and must be at least 20 characters"),
});

const step2Schema = z
  .object({
    selectedProvider: z.string().optional(),
    selectedModel: z.string().optional(),
    spendingLimit: z
      .string()
      .optional()
      .refine((v) => !v || parseFloat(v) > 0, {
        message: "Spending limit must be greater than 0",
      }),
  })
  .refine((d) => !d.selectedProvider || !!d.selectedModel, {
    message: "Select a model for the chosen provider",
    path: ["selectedModel"],
  });

const step3Schema = z.object({
  githubToken: z
    .string()
    .optional()
    .refine((v) => !v || /^(ghp_|github_pat_)[A-Za-z0-9_]+$/.test(v), {
      message: "Token must start with ghp_ or github_pat_",
    }),
});

type FieldErrors = Record<string, string>;

interface FormState {
  title: string;
  email: string;
  botSkillDescription: string;
  selectedProvider: string;
  selectedModel: string;
  githubToken: string;
  spendingLimit: string;
  autonomyLevel: "autonomous" | "supervised";
  supervisedSettings: SupervisedSettings;
}

const defaultForm: FormState = {
  title: "",
  email: "",
  botSkillDescription: "",
  selectedProvider: "",
  selectedModel: "",
  githubToken: "",
  spendingLimit: "",
  autonomyLevel: "supervised",
  supervisedSettings: defaultSupervisedSettings,
};

function botToForm(bot: BotConfig): FormState {
  return {
    title: bot.title,
    email: bot.email,
    botSkillDescription: bot.botSkillDescription,
    selectedProvider: bot.defaultProvider ?? "",
    selectedModel: bot.defaultModel ?? "",
    githubToken: bot.githubToken ?? "",
    spendingLimit: bot.spendingLimit?.toString() ?? "",
    autonomyLevel: bot.autonomyLevel,
    supervisedSettings: bot.supervisedSettings,
  };
}

interface DialogState {
  step: number;
  errors: FieldErrors;
  form: FormState;
}

const defaultState: DialogState = { step: 1, errors: {}, form: defaultForm };

function resetState(bot: BotConfig | null | undefined): DialogState {
  return { step: 1, errors: {}, form: bot ? botToForm(bot) : defaultForm };
}

// ─────────────────────────────────────────────────────────────────────────────

export function BotDialog({ open, onOpenChange, bot, providers, onSave }: BotDialogProps) {
  const [state, setState] = useState<DialogState>(defaultState);
  const { step, errors, form } = state;

  const enabledProviders = providers.filter((p) => p.enabled);
  const activeProvider = enabledProviders.find((p) => p.id === form.selectedProvider);
  const availableModels = activeProvider?.models ?? [];

  useEffect(() => {
    if (!open) return;
    setState(resetState(bot));
  }, [bot, open]);

  const clearError = (field: string) =>
    setState((prev) => {
      const next = { ...prev.errors };
      delete next[field];
      return { ...prev, errors: next };
    });

  const handleProviderChange = (providerId: string) => {
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, selectedProvider: providerId, selectedModel: "" },
      errors: (({ selectedProvider: _, selectedModel: __, ...rest }) => rest)(prev.errors),
    }));
  };

  const toggleSupervisedSetting = (key: keyof SupervisedSettings) => {
    setState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        supervisedSettings: {
          ...prev.form.supervisedSettings,
          [key]: !prev.form.supervisedSettings[key],
        },
      },
    }));
  };

  function validateStep(): boolean {
    const result = (() => {
      if (step === 1) return stepAutonomySchema.safeParse({ title: form.title });
      if (step === 2)
        return step1Schema.safeParse({
          title: form.title,
          email: form.email,
          botSkillDescription: form.botSkillDescription,
        });
      if (step === 3)
        return step2Schema.safeParse({
          selectedProvider: form.selectedProvider,
          selectedModel: form.selectedModel,
          spendingLimit: form.spendingLimit,
        });
      if (step === 4) return step3Schema.safeParse({ githubToken: form.githubToken });
      return { success: true as const };
    })();

    if (!result.success) {
      const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
      setState((prev) => ({
        ...prev,
        errors: Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v[0]])),
      }));
      return false;
    }
    setState((prev) => ({ ...prev, errors: {} }));
    return true;
  }

  const handleNext = () => {
    if (validateStep())
      setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, STEPS.length) }));
  };
  const handleBack = () => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1), errors: {} }));
  };
  const handleSkip = () => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, STEPS.length), errors: {} }));
  };

  const handleSubmit = () => {
    if (!validateStep()) return;
    onSave({
      title: form.title,
      email: form.email,
      botSkillDescription: form.botSkillDescription,
      enabledChannels: bot?.enabledChannels ?? [],
      defaultProvider: form.selectedProvider || undefined,
      defaultModel: form.selectedModel || undefined,
      githubToken: form.githubToken || undefined,
      spendingLimit: form.spendingLimit ? parseFloat(form.spendingLimit) : undefined,
      autonomyLevel: form.autonomyLevel,
      supervisedSettings:
        form.autonomyLevel === "supervised" ? form.supervisedSettings : defaultSupervisedSettings,
      systemPromptId: bot?.systemPromptId,
    });
    onOpenChange(false);
  };

  const currentStepMeta = STEPS[step - 1];
  const isLastStep = step === STEPS.length;
  const isFirstStep = step === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bot ? "Edit Bot" : "Create Bot"}</DialogTitle>
          <DialogDescription>
            {bot ? "Update the bot's configuration." : "Set up a new bot in a few steps."}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-center gap-1">
                  {i > 0 && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        isCompleted || isCurrent ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2 transition-all",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary/10 text-primary",
                      !isCurrent && !isCompleted && "border-border text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        isCompleted ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                  {s.optional && <span className="ml-0.5 opacity-60">*</span>}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-muted-foreground -mt-1 text-right text-[10px]">* optional</p>

        {/* Step content */}
        <div className="flex flex-col gap-6 py-1">
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Backend Engineer"
                  value={form.title}
                  onChange={(e) => {
                    setState((prev) => ({
                      ...prev,
                      form: { ...prev.form, title: e.target.value },
                    }));
                    clearError("title");
                  }}
                  aria-invalid={!!errors.title}
                  className={cn(
                    errors.title && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {errors.title && <p className="text-destructive text-[11px]">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      form: { ...prev.form, autonomyLevel: "supervised" },
                    }))
                  }
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
                      form.autonomyLevel === "supervised"
                        ? "text-warning"
                        : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      form.autonomyLevel === "supervised"
                        ? "text-warning"
                        : "text-muted-foreground",
                    )}
                  >
                    Supervised
                  </span>
                  <span className="text-muted-foreground text-center text-[11px] leading-relaxed">
                    Bot confirms actions before executing
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      form: { ...prev.form, autonomyLevel: "autonomous" },
                    }))
                  }
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
                      form.autonomyLevel === "autonomous"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      form.autonomyLevel === "autonomous"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    Autonomous
                  </span>
                  <span className="text-muted-foreground text-center text-[11px] leading-relaxed">
                    Bot acts independently without confirmation
                  </span>
                </button>
              </div>

              {form.autonomyLevel === "supervised" && (
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
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
                          onCheckedChange={() => toggleSupervisedSetting(key)}
                        />
                        <span className="text-foreground text-xs">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="bot@jiraclaw.ai"
                  value={form.email}
                  onChange={(e) => {
                    setState((prev) => ({
                      ...prev,
                      form: { ...prev.form, email: e.target.value },
                    }));
                    clearError("email");
                  }}
                  aria-invalid={!!errors.email}
                  className={cn(
                    errors.email && "border-destructive focus-visible:ring-destructive",
                  )}
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
                <Label htmlFor="description">Bot Skills Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the bot's role, responsibilities, and behavior..."
                  rows={6}
                  value={form.botSkillDescription}
                  onChange={(e) => {
                    setState((prev) => ({
                      ...prev,
                      form: { ...prev.form, botSkillDescription: e.target.value },
                    }));
                    clearError("botSkillDescription");
                  }}
                  aria-invalid={!!errors.botSkillDescription}
                  className={cn(
                    "min-h-50",
                    errors.botSkillDescription &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {errors.botSkillDescription && (
                  <p className="text-destructive text-[11px]">{errors.botSkillDescription}</p>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-muted-foreground text-xs">
                Choose an AI provider and model for this bot. You can skip this and configure it
                later.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={form.selectedProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger className="w-full" id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {enabledProviders.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={form.selectedModel}
                    onValueChange={(v) => {
                      setState((prev) => ({ ...prev, form: { ...prev.form, selectedModel: v } }));
                      clearError("selectedModel");
                    }}
                    disabled={!form.selectedProvider || availableModels.length === 0}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.selectedModel && "border-destructive focus-visible:ring-destructive",
                      )}
                      id="model"
                    >
                      <SelectValue
                        placeholder={availableModels.length === 0 ? "No models" : "Select model"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.selectedModel && (
                    <p className="text-destructive text-[11px]">{errors.selectedModel}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="spending-limit">Spending Limit (USD/mo)</Label>
                <Input
                  id="spending-limit"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 100"
                  value={form.spendingLimit}
                  onChange={(e) => {
                    setState((prev) => ({
                      ...prev,
                      form: { ...prev.form, spendingLimit: e.target.value },
                    }));
                    clearError("spendingLimit");
                  }}
                  aria-invalid={!!errors.spendingLimit}
                  className={cn(
                    errors.spendingLimit && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {errors.spendingLimit ? (
                  <p className="text-destructive text-[11px]">{errors.spendingLimit}</p>
                ) : (
                  <p className="text-muted-foreground text-[11px]">Max AI spend per month</p>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-muted-foreground text-xs">
                Optionally provide a dedicated GitHub token for this bot. You can add it later.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="github-token">GitHub Token</Label>
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_..."
                  value={form.githubToken}
                  onChange={(e) => {
                    setState((prev) => ({
                      ...prev,
                      form: { ...prev.form, githubToken: e.target.value },
                    }));
                    clearError("githubToken");
                  }}
                  aria-invalid={!!errors.githubToken}
                  className={cn(
                    errors.githubToken && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {errors.githubToken ? (
                  <p className="text-destructive text-[11px]">{errors.githubToken}</p>
                ) : (
                  <p className="text-muted-foreground text-[11px]">Dedicated token for this bot</p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex">
          {currentStepMeta.optional && (
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}

          {isFirstStep ? (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          <div className="flex gap-2">
            {isLastStep ? (
              <Button type="button" onClick={handleSubmit}>
                {bot ? "Save Changes" : "Create Bot"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
