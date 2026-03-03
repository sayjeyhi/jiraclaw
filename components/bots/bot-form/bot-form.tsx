"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useParams } from "next/navigation";
import type { BotConfig, AIProvider, SystemPrompt } from "@/lib/types";
import {
  STEPS,
  defaultSupervisedSettings,
  stepAutonomySchema,
  stepSkillSchema,
  stepTicketProviderSchema,
  stepAIModelSchema,
} from "./constants";
import { resetState } from "./utils";
import type { FormState, FormComponentState } from "./types";
import { StepIndicator } from "./step-indicator";
import { StepAutonomy } from "./step-autonomy";
import { StepSkill } from "./step-skill";
import { StepTicketProvider } from "./step-ticket-provider";
import { StepAIModel } from "./step-ai-model";
import type { JiraProject } from "@/lib/types";

interface RepoRow {
  url: string;
  label: string;
}

interface BotFormProps {
  bot?: BotConfig | null;
  providers: AIProvider[];
  prompts: SystemPrompt[];
  bots?: { id: string; title: string; systemPromptId?: string | null }[];
  onCreatePrompt?: (data: {
    name: string;
    content: string;
    isGlobal: boolean;
    botIds?: string[];
  }) => Promise<{ id: string } | void>;
  onPromptsChange?: () => void;
  jiraProjects?: JiraProject[];
  onCreateJiraProject?: (
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => Promise<JiraProject>;
  onEditJiraProject?: (
    project: JiraProject,
    data: Pick<JiraProject, "name" | "key" | "url"> & { apiKey?: string; repos: RepoRow[] },
  ) => Promise<void>;
  onJiraProjectsChange?: () => void;
  onAiSave?: (slug: string, apiKey: string, enabled: boolean) => Promise<void>;
  onAiProvidersChange?: () => void;
  onSave: (
    data: Omit<BotConfig, "id" | "createdAt" | "status"> & { jiraProjectId?: string },
  ) => Promise<void>;
}

export function BotForm({
  bot,
  providers,
  prompts,
  bots = [],
  onCreatePrompt,
  onPromptsChange = () => {},
  jiraProjects = [],
  onCreateJiraProject,
  onEditJiraProject,
  onJiraProjectsChange = () => {},
  onAiSave,
  onAiProvidersChange = () => {},
  onSave,
}: BotFormProps) {
  const linkedJiraProjectId = jiraProjects.find((p) => p.botId === bot?.id)?.id;
  const [state, setState] = useState<FormComponentState>(() =>
    resetState(bot, linkedJiraProjectId, prompts),
  );
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { step, errors, form, isSubmitting } = state;

  useEffect(() => {
    setState(resetState(bot, linkedJiraProjectId, prompts));
  }, [bot, bot?.id, linkedJiraProjectId, prompts]);

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
      if (step === 1)
        return stepAutonomySchema.safeParse({
          title: form.title,
          email: form.email,
        });
      if (step === 2) return stepTicketProviderSchema.safeParse({ githubToken: form.githubToken });
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

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      // Only send githubToken when changed: omit when unchanged (masked value), send "" to clear, send new raw key when entered
      const savedMasked = bot?.githubToken ?? "";
      const tokenUnchanged = form.githubToken === savedMasked;
      const isMaskedValue = form.githubToken?.includes("***");
      const githubToken =
        tokenUnchanged || isMaskedValue
          ? undefined
          : form.githubToken === ""
            ? ""
            : form.githubToken || undefined;

      await onSave({
        title: form.title,
        email: form.email,
        skills: form.skills,
        botSkillDescription: form.botSkillDescription.trim() || "",
        enabledChannels: bot?.enabledChannels ?? [],
        defaultProvider: form.selectedProvider || undefined,
        defaultModel: form.selectedModel || undefined,
        ...(githubToken !== undefined && { githubToken }),
        spendingLimit: form.spendingLimit ? parseFloat(form.spendingLimit) : undefined,
        autonomyLevel: form.autonomyLevel,
        supervisedSettings:
          form.autonomyLevel === "supervised" ? form.supervisedSettings : defaultSupervisedSettings,
        systemPromptId: form.selectedSystemPromptId || form.selectedGlobalPromptId || null,
        workspaceId,
        jiraProjectId: form.selectedJiraProjectId || undefined,
      });
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const isLastStep = step === STEPS.length;
  const isFirstStep = step === 1;
  const botsListHref = `/w/${workspaceId}/bots`;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={bot ? "Edit Bot" : "Create Bot Wizard"}
        description={bot ? "Update the bot's configuration." : "Set up a new bot in a few steps."}
        backHref={botsListHref}
      />

      <StepIndicator currentStep={step} />

      <div className="border-border bg-card flex flex-col gap-6 rounded-lg border p-6">
        {step === 1 && (
          <StepAutonomy
            form={form}
            errors={errors}
            onFormChange={setForm}
            onToggleSupervisedSetting={toggleSupervisedSetting}
            onClearError={clearError}
          />
        )}

        {step === 2 && (
          <StepTicketProvider
            form={form}
            errors={errors}
            projects={jiraProjects}
            onFormChange={setForm}
            onClearError={clearError}
            onCreateProject={
              onCreateJiraProject ??
              (async () => {
                throw new Error("Project creation not available");
              })
            }
            onEditProject={onEditJiraProject}
            onProjectsChange={onJiraProjectsChange}
          />
        )}

        {step === 3 && (
          <StepSkill
            form={form}
            errors={errors}
            prompts={prompts}
            onFormChange={setForm}
            onClearError={clearError}
            bots={bots}
            onCreatePrompt={onCreatePrompt}
            onPromptsChange={onPromptsChange}
          />
        )}

        {step === 4 && (
          <StepAIModel
            form={form}
            errors={errors}
            providers={providers}
            workspaceId={workspaceId}
            onFormChange={setForm}
            onProviderChange={handleProviderChange}
            onClearError={clearError}
            onAiSave={onAiSave}
            onAiProvidersChange={onAiProvidersChange}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div />
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
