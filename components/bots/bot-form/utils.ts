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
  selectedChannelIds: [],
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
  let selectedGlobalPromptId = bot.globalPromptId ?? "";
  let selectedSystemPromptId = bot.systemPromptId ?? "";
  // Migrate old data: bot had only systemPromptId, infer global vs local from prompt
  if (!bot.globalPromptId && bot.systemPromptId && prompts) {
    const prompt = prompts.find((p) => p.id === bot.systemPromptId);
    if (prompt?.isGlobal) {
      selectedGlobalPromptId = bot.systemPromptId;
      selectedSystemPromptId = "";
    } else {
      selectedSystemPromptId = bot.systemPromptId;
      selectedGlobalPromptId = "";
    }
  }
  return {
    title: bot.title,
    email: bot.email,
    selectedGlobalPromptId,
    selectedSystemPromptId,
    skills: bot.skills ?? [],
    botSkillDescription: bot.botSkillDescription ?? "",
    selectedTicketIntegration: "jira",
    selectedJiraProjectId: linkedJiraProjectId ?? "",
    selectedProvider: bot.defaultProvider ?? "",
    selectedModel: bot.defaultModel ?? "",
    selectedChannelIds: bot.enabledChannels ?? [],
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
