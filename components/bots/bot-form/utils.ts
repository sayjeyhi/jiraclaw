import type { BotConfig } from "@/lib/types";
import { defaultSupervisedSettings } from "./constants";
import type { FormState, FormComponentState } from "./types";

export const defaultForm: FormState = {
  title: "",
  email: "",
  selectedGlobalPromptId: "",
  selectedSystemPromptId: "",
  skills: [],
  botSkillDescription: "",
  selectedTicketIntegration: "",
  selectedJiraProjectId: "",
  selectedProvider: "",
  selectedModel: "",
  githubToken: "",
  spendingLimit: "",
  autonomyLevel: "supervised",
  supervisedSettings: defaultSupervisedSettings,
};

export function botToForm(bot: BotConfig, linkedJiraProjectId?: string): FormState {
  return {
    title: bot.title,
    email: bot.email,
    selectedGlobalPromptId: "",
    selectedSystemPromptId: bot.systemPromptId ?? "",
    skills: bot.skills ?? [],
    botSkillDescription: bot.botSkillDescription ?? "",
    selectedTicketIntegration: linkedJiraProjectId ? "jira" : "",
    selectedJiraProjectId: linkedJiraProjectId ?? "",
    selectedProvider: bot.defaultProvider ?? "",
    selectedModel: bot.defaultModel ?? "",
    githubToken: bot.githubToken ?? "",
    spendingLimit: bot.spendingLimit?.toString() ?? "",
    autonomyLevel: bot.autonomyLevel,
    supervisedSettings: bot.supervisedSettings,
  };
}

export function resetState(
  bot: BotConfig | null | undefined,
  linkedJiraProjectId?: string,
): FormComponentState {
  return {
    step: 1,
    errors: {},
    form: bot ? botToForm(bot, linkedJiraProjectId) : defaultForm,
    isSubmitting: false,
  };
}
