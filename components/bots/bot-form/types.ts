import type { BotConfig, SupervisedSettings } from "@/lib/types";

export type FieldErrors = Record<string, string>;

export interface FormState {
  title: string;
  email: string;
  selectedGlobalPromptId: string;
  selectedSystemPromptId: string; // local/bot-specific prompt
  skills: string[];
  botSkillDescription: string;
  selectedTicketIntegration: string;
  selectedJiraProjectId: string;
  selectedProvider: string;
  selectedModel: string;
  selectedChannelIds: string[];
  githubToken: string;
  spendingLimit: string;
  autonomyLevel: "autonomous" | "supervised";
  supervisedSettings: SupervisedSettings;
}

export interface FormComponentState {
  step: number;
  errors: FieldErrors;
  form: FormState;
  isSubmitting: boolean;
}
