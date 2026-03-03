import type { BotConfig, SystemPrompt } from "@/lib/types";
import { defaultSupervisedSettings } from "./constants";
import type { FormState, FormComponentState } from "./types";

export const defaultForm: FormState = {
  title: "",
  email: "",
  selectedGlobalPromptId: "",
  selectedSystemPromptId: "",
  skills: [],
  botSkillDescription: "",
  selectedTicketIntegration: "jira", // Jira is the only enabled integration for now
  selectedJiraProjectId: "",
  selectedProvider: "",
  selectedModel: "",
  githubToken: "",
  spendingLimit: "",
  autonomyLevel: "supervised",
  supervisedSettings: defaultSupervisedSettings,
};

export function botToForm(
  bot: BotConfig,
  linkedJiraProjectId?: string,
  prompts?: SystemPrompt[],
): FormState {
  const systemPromptId = bot.systemPromptId ?? "";
  const prompt = systemPromptId && prompts?.find((p) => p.id === systemPromptId);
  const isGlobal = prompt?.isGlobal ?? false;
  return {
    title: bot.title,
    email: bot.email,
    selectedGlobalPromptId: isGlobal ? systemPromptId : "",
    selectedSystemPromptId: !isGlobal ? systemPromptId : "",
    skills: bot.skills ?? [],
    botSkillDescription: bot.botSkillDescription ?? "",
    selectedTicketIntegration: "jira",
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
  prompts?: SystemPrompt[],
): FormComponentState {
  return {
    step: 1,
    errors: {},
    form: bot ? botToForm(bot, linkedJiraProjectId, prompts) : defaultForm,
    isSubmitting: false,
  };
}
