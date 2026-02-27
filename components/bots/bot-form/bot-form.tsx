"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import type { BotConfig, AIProvider, SystemPrompt } from "@/lib/types";
import {
  STEPS,
  defaultSupervisedSettings,
  stepAutonomySchema,
  stepIdentitySchema,
  stepSkillSchema,
  stepAIModelSchema,
  stepCredentialsSchema,
} from "./constants";
import { resetState } from "./utils";
import type { FormState, FormComponentState } from "./types";
import { StepIndicator } from "./step-indicator";
import { StepAutonomy } from "./step-autonomy";
import { StepIdentity } from "./step-identity";
import { StepSkill } from "./step-skill";
import { StepAIModel } from "./step-ai-model";
import { StepCredentials } from "./step-credentials";

interface BotFormProps {
  bot?: BotConfig | null;
  providers: AIProvider[];
  prompts: SystemPrompt[];
  onSave: (data: Omit<BotConfig, "id" | "createdAt" | "status">) => Promise<void>;
}

export function BotForm({ bot, providers, prompts, onSave }: BotFormProps) {
  const [state, setState] = useState<FormComponentState>(() => resetState(bot));
  const [showToken, setShowToken] = useState(false);
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { step, errors, form, isSubmitting } = state;

  const enabledProviders = providers.filter((p) => p.enabled);
  const activeProvider = enabledProviders.find((p) => p.id === form.selectedProvider);
  const availableModels = activeProvider?.models ?? [];

  useEffect(() => {
    setState(resetState(bot));
    setShowToken(false);
  }, [bot, bot?.id]);

  const clearError = (field: string) =>
    setState((prev) => {
      const next = { ...prev.errors };
      delete next[field];
      return { ...prev, errors: next };
    });

  const setForm = (updater: (prev: FormState) => FormState) =>
    setState((prev) => ({ ...prev, form: updater(prev.form) }));

  const handleProviderChange = (providerId: string) => {
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, selectedProvider: providerId, selectedModel: "" },
      errors: (({ selectedProvider: _, selectedModel: __, ...rest }) => rest)(prev.errors),
    }));
  };

  const toggleSupervisedSetting = (key: keyof import("@/lib/types").SupervisedSettings) => {
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
      if (step === 1) return stepAutonomySchema.safeParse({});
      if (step === 2)
        return stepIdentitySchema.safeParse({
          title: form.title,
          email: form.email,
        });
      if (step === 3)
        return stepSkillSchema.safeParse({
          skills: form.skills,
          botSkillDescription: form.botSkillDescription,
        });
      if (step === 4)
        return stepAIModelSchema.safeParse({
          selectedProvider: form.selectedProvider,
          selectedModel: form.selectedModel,
          spendingLimit: form.spendingLimit,
        });
      if (step === 5) return stepCredentialsSchema.safeParse({ githubToken: form.githubToken });
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

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await onSave({
        title: form.title,
        email: form.email,
        skills: form.skills,
        botSkillDescription: form.botSkillDescription.trim() || "",
        enabledChannels: bot?.enabledChannels ?? [],
        defaultProvider: form.selectedProvider || undefined,
        defaultModel: form.selectedModel || undefined,
        githubToken: form.githubToken || undefined,
        spendingLimit: form.spendingLimit ? parseFloat(form.spendingLimit) : undefined,
        autonomyLevel: form.autonomyLevel,
        supervisedSettings:
          form.autonomyLevel === "supervised" ? form.supervisedSettings : defaultSupervisedSettings,
        systemPromptId: form.selectedSystemPromptId || null,
        workspaceId,
      });
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const currentStepMeta = STEPS[step - 1];
  const isLastStep = step === STEPS.length;
  const isFirstStep = step === 1;
  const botsListHref = `/w/${workspaceId}/bots`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={bot ? "Edit Bot" : "Create Bot"}
        description={bot ? "Update the bot's configuration." : "Set up a new bot in a few steps."}
      >
        <Button variant="ghost" size="sm" asChild>
          <Link href={botsListHref}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <StepIndicator currentStep={step} />

      <div className="border-border bg-card flex flex-col gap-6 rounded-lg border p-6">
        {step === 1 && (
          <StepAutonomy
            form={form}
            onFormChange={setForm}
            onToggleSupervisedSetting={toggleSupervisedSetting}
          />
        )}

        {step === 2 && (
          <StepIdentity
            form={form}
            errors={errors}
            prompts={prompts}
            onFormChange={setForm}
            onClearError={clearError}
          />
        )}

        {step === 3 && (
          <StepSkill form={form} errors={errors} onFormChange={setForm} onClearError={clearError} />
        )}

        {step === 4 && (
          <StepAIModel
            form={form}
            errors={errors}
            enabledProviders={enabledProviders}
            availableModels={availableModels}
            onFormChange={setForm}
            onProviderChange={handleProviderChange}
            onClearError={clearError}
          />
        )}

        {step === 5 && (
          <StepCredentials
            form={form}
            errors={errors}
            showToken={showToken}
            onFormChange={setForm}
            onToggleShowToken={() => setShowToken((v) => !v)}
            onClearError={clearError}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          {currentStepMeta.optional && !isLastStep && (
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {isFirstStep ? (
            <Button type="button" variant="outline" asChild>
              <Link href={botsListHref}>Cancel</Link>
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          {isLastStep ? (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : bot ? "Save Changes" : "Create Bot"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
