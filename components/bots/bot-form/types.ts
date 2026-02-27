import type { BotConfig, SupervisedSettings } from "@/lib/types";

export type FieldErrors = Record<string, string>;

export interface FormState {
  title: string;
  email: string;
  selectedSystemPromptId: string;
  skills: string[];
  botSkillDescription: string;
  selectedProvider: string;
  selectedModel: string;
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
