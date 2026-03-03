import { z } from "zod";
import { Cpu, Kanban, ShieldCheck, Sparkles } from "lucide-react";
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
  { id: 2, label: "Skills", icon: Sparkles, optional: false },
  { id: 3, label: "Project", icon: Kanban, optional: true },
  { id: 4, label: "AI Model", icon: Cpu, optional: true },
] as const;

export const TICKET_INTEGRATIONS = [
  {
    id: "jira",
    name: "Jira",
    description:
      "Connect a Jira project and link GitHub repositories for automated ticket monitoring.",
    icon: Kanban,
  },
] as const;

// ── Zod schemas ──────────────────────────────────────────────────────────────

export const stepAutonomySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
});

export const stepSkillSchema = z
  .object({
    skills: z.array(z.string()).max(10, "Maximum 10 skills allowed"),
    botSkillDescription: z.string(),
  })
  .refine((d) => d.skills.length > 0 || (d.botSkillDescription?.trim().length ?? 0) >= 20, {
    message: "Add at least one skill or a description (min 20 characters)",
    path: ["skills"],
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
    .optional()
    .refine((v) => !v || /^(ghp_|github_pat_)[A-Za-z0-9_]+$/.test(v), {
      message: "Token must start with ghp_ or github_pat_",
    }),
});
