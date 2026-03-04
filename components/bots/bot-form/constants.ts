import { z } from "zod";
import {
  Cpu,
  Kanban,
  LayoutGrid,
  ListChecks,
  Radio,
  ShieldCheck,
  Sparkles,
  Trello,
} from "lucide-react";
import type { SupervisedSettings } from "@/lib/types";

export const defaultSupervisedSettings: SupervisedSettings = {
  confirmSolutionBeforeStart: false,
  allowPrCreation: true,
  allowPush: false,
  allowJiraComment: true,
  allowIssueTransition: true,
};

export const STEPS = [
  { id: 1, label: "Identity & Autonomy", icon: ShieldCheck, optional: false },
  { id: 2, label: "Tickets & Git", icon: Kanban, optional: true },
  { id: 3, label: "Skills", icon: Sparkles, optional: false },
  { id: 4, label: "AI Model", icon: Cpu, optional: true },
  { id: 5, label: "Channels", icon: Radio, optional: true },
] as const;

export const TICKET_INTEGRATIONS = [
  {
    id: "jira",
    name: "Jira",
    description:
      "Connect a Jira project and link GitHub repositories for automated ticket monitoring.",
    icon: Kanban,
    disabled: false,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Coming soon. Connect Linear workspaces for issue tracking.",
    icon: ListChecks,
    disabled: true,
  },
  {
    id: "trello",
    name: "Trello",
    description: "Coming soon. Connect Trello boards for project management.",
    icon: Trello,
    disabled: true,
  },
  {
    id: "clickup",
    name: "ClickUp",
    description: "Coming soon. Connect ClickUp workspaces for task management.",
    icon: LayoutGrid,
    disabled: true,
  },
] as const;

// ── Zod schemas ──────────────────────────────────────────────────────────────

export const stepAutonomySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
});

export const stepSkillSchema = z.object({
  skills: z.array(z.string()).max(10, "Maximum 10 skills allowed"),
  botSkillDescription: z.string(),
});

export const stepChannelsSchema = z.object({
  selectedChannelIds: z.array(z.string()).max(2, "Select up to 2 channels"),
});

export const stepAIModelSchema = z
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

export const stepTicketProviderSchema = z.object({
  githubToken: z
    .string()
    .min(1, "GitHub token is required")
    .refine(
      (v) =>
        v.includes("***") || // masked display value from API (already set)
        /^(ghp_|github_pat_)[A-Za-z0-9_]+$/.test(v),
      { message: "Token must start with ghp_ or github_pat_" },
    ),
});
