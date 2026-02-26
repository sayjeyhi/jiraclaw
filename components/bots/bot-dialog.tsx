"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BotConfig, AIProvider, SupervisedSettings } from "@/lib/types";
import { Eye, Zap, Bot, Cpu, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot?: BotConfig | null;
  providers: AIProvider[];
  onSave: (data: Omit<BotConfig, "id" | "createdAt" | "status">) => void;
}

const defaultSupervisedSettings: SupervisedSettings = {
  confirmPrCreation: true,
  confirmPush: false,
  confirmJiraComment: true,
  confirmSolution: false,
};

const STEPS = [
  { id: 1, label: "Basics", icon: Bot, optional: false },
  { id: 2, label: "AI Model", icon: Cpu, optional: true },
  { id: 3, label: "Credentials", icon: KeyRound, optional: true },
  { id: 4, label: "Autonomy", icon: ShieldCheck, optional: false },
] as const;

export function BotDialog({ open, onOpenChange, bot, providers, onSave }: BotDialogProps) {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [githubToken, setGithubToken] = useState("");
  const [spendingLimit, setSpendingLimit] = useState<string>("");
  const [autonomyLevel, setAutonomyLevel] = useState<"autonomous" | "supervised">("autonomous");
  const [supervisedSettings, setSupervisedSettings] =
    useState<SupervisedSettings>(defaultSupervisedSettings);

  const enabledProviders = providers.filter((p) => p.enabled);
  const activeProvider = enabledProviders.find((p) => p.id === selectedProvider);
  const availableModels = activeProvider?.models ?? [];

  useEffect(() => {
    if (open) {
      setStep(1);
      if (bot) {
        setTitle(bot.title);
        setEmail(bot.email);
        setJobDescription(bot.jobDescription);
        setSelectedProvider(bot.defaultProvider ?? "");
        setSelectedModel(bot.defaultModel ?? "");
        setGithubToken(bot.githubToken ?? "");
        setSpendingLimit(bot.spendingLimit?.toString() ?? "");
        setAutonomyLevel(bot.autonomyLevel);
        setSupervisedSettings(bot.supervisedSettings);
      } else {
        setTitle("");
        setEmail("");
        setJobDescription("");
        setSelectedProvider("");
        setSelectedModel("");
        setGithubToken("");
        setSpendingLimit("");
        setAutonomyLevel("autonomous");
        setSupervisedSettings(defaultSupervisedSettings);
      }
    }
  }, [bot, open]);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setSelectedModel("");
  };

  const toggleSupervisedSetting = (key: keyof SupervisedSettings) => {
    setSupervisedSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isStep1Valid = title.trim() !== "" && email.trim() !== "" && jobDescription.trim() !== "";

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));
  const handleSkip = () => handleNext();

  const handleSubmit = () => {
    onSave({
      title,
      email,
      jobDescription,
      enabledChannels: bot?.enabledChannels ?? [],
      defaultProvider: selectedProvider || undefined,
      defaultModel: selectedModel || undefined,
      githubToken: githubToken || undefined,
      spendingLimit: spendingLimit ? parseFloat(spendingLimit) : undefined,
      autonomyLevel,
      supervisedSettings:
        autonomyLevel === "supervised" ? supervisedSettings : defaultSupervisedSettings,
      systemPromptId: bot?.systemPromptId,
    });
    onOpenChange(false);
  };

  const currentStepMeta = STEPS[step - 1];
  const isLastStep = step === STEPS.length;
  const isFirstStep = step === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bot ? "Edit Bot" : "Create Bot"}</DialogTitle>
          <DialogDescription>
            {bot ? "Update the bot's configuration." : "Set up a new bot in a few steps."}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-center gap-1">
                  {i > 0 && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        isCompleted || isCurrent ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2 transition-all",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary/10 text-primary",
                      !isCurrent && !isCompleted && "border-border text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        isCompleted ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                  {s.optional && <span className="ml-0.5 opacity-60">*</span>}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-muted-foreground -mt-1 text-right text-[10px]">* optional</p>

        {/* Step content */}
        <div className="flex flex-col gap-4 py-1">
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="bot@jiraclaw.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-muted-foreground -mt-1 text-[9px]">
                  Used for Jira assignment detection
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Bot Skills Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the bot's role, responsibilities, and behavior..."
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-muted-foreground text-xs">
                Choose an AI provider and model for this bot. You can skip this and configure it
                later.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={selectedProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {enabledProviders.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={!selectedProvider || availableModels.length === 0}
                  >
                    <SelectTrigger id="model">
                      <SelectValue
                        placeholder={availableModels.length === 0 ? "No models" : "Select model"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-muted-foreground text-xs">
                Optionally provide a GitHub token and a monthly spending cap. Both can be added
                later.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="github-token">GitHub Token</Label>
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                  <p className="text-muted-foreground text-[11px]">Dedicated token for this bot</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="spending-limit">Spending Limit (USD/mo)</Label>
                  <Input
                    id="spending-limit"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 100"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(e.target.value)}
                  />
                  <p className="text-muted-foreground text-[11px]">Max AI spend per month</p>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAutonomyLevel("autonomous")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-4 transition-all",
                    autonomyLevel === "autonomous"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                >
                  <Zap
                    className={cn(
                      "size-5",
                      autonomyLevel === "autonomous" ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      autonomyLevel === "autonomous" ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    Autonomous
                  </span>
                  <span className="text-muted-foreground text-center text-[11px] leading-relaxed">
                    Bot acts independently without confirmation
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutonomyLevel("supervised")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-4 transition-all",
                    autonomyLevel === "supervised"
                      ? "border-warning bg-warning/5"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                >
                  <Eye
                    className={cn(
                      "size-5",
                      autonomyLevel === "supervised" ? "text-warning" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      autonomyLevel === "supervised" ? "text-warning" : "text-muted-foreground",
                    )}
                  >
                    Supervised
                  </span>
                  <span className="text-muted-foreground text-center text-[11px] leading-relaxed">
                    Bot confirms actions before executing
                  </span>
                </button>
              </div>

              {autonomyLevel === "supervised" && (
                <div className="border-warning/20 bg-warning/5 flex flex-col gap-3 rounded-lg border p-4">
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    The bot will confirm actions via channels before doing the activity
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { key: "confirmPrCreation" as const, label: "Confirm PR creation" },
                      { key: "confirmPush" as const, label: "Confirm Push" },
                      { key: "confirmJiraComment" as const, label: "Confirm Jira Comment" },
                      { key: "confirmSolution" as const, label: "Confirm Solution" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex cursor-pointer items-center gap-2.5">
                        <Checkbox
                          checked={supervisedSettings[key]}
                          onCheckedChange={() => toggleSupervisedSetting(key)}
                        />
                        <span className="text-foreground text-xs">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {isFirstStep ? (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          <div className="flex gap-2">
            {currentStepMeta.optional && (
              <Button type="button" variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}

            {isLastStep ? (
              <Button type="button" onClick={handleSubmit}>
                {bot ? "Save Changes" : "Create Bot"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} disabled={step === 1 && !isStep1Valid}>
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
