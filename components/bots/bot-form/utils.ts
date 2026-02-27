import type { BotConfig } from "@/lib/types";
import { defaultSupervisedSettings } from "./constants";
import type { FormState, FormComponentState } from "./types";

export const defaultForm: FormState = {
  title: "",
  email: "",
  selectedSystemPromptId: "",
  skills: [],
  botSkillDescription: "",
  selectedProvider: "",
  selectedModel: "",
  githubToken: "",
  spendingLimit: "",
  autonomyLevel: "supervised",
  supervisedSettings: defaultSupervisedSettings,
};

export function botToForm(bot: BotConfig): FormState {
  return {
    title: bot.title,
    email: bot.email,
    selectedSystemPromptId: bot.systemPromptId ?? "",
    skills: bot.skills ?? [],
    botSkillDescription: bot.botSkillDescription ?? "",
    selectedProvider: bot.defaultProvider ?? "",
    selectedModel: bot.defaultModel ?? "",
    githubToken: bot.githubToken ?? "",
    spendingLimit: bot.spendingLimit?.toString() ?? "",
    autonomyLevel: bot.autonomyLevel,
    supervisedSettings: bot.supervisedSettings,
  };
}

export function resetState(bot: BotConfig | null | undefined): FormComponentState {
  return {
    step: 1,
    errors: {},
    form: bot ? botToForm(bot) : defaultForm,
    isSubmitting: false,
  };
}
