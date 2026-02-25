"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { BotConfig, AIProvider, SupervisedSettings } from "@/lib/types"
import { Eye, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface BotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bot?: BotConfig | null
  providers: AIProvider[]
  onSave: (data: Omit<BotConfig, "id" | "createdAt" | "status">) => void
}

const defaultSupervisedSettings: SupervisedSettings = {
  confirmPrCreation: true,
  confirmPush: false,
  confirmJiraComment: true,
  confirmSolution: false,
}

export function BotDialog({ open, onOpenChange, bot, providers, onSave }: BotDialogProps) {
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [githubToken, setGithubToken] = useState("")
  const [spendingLimit, setSpendingLimit] = useState<string>("")
  const [autonomyLevel, setAutonomyLevel] = useState<"autonomous" | "supervised">("autonomous")
  const [supervisedSettings, setSupervisedSettings] = useState<SupervisedSettings>(defaultSupervisedSettings)

  const enabledProviders = providers.filter((p) => p.enabled)
  const activeProvider = enabledProviders.find((p) => p.id === selectedProvider)
  const availableModels = activeProvider?.models ?? []

  useEffect(() => {
    if (bot) {
      setTitle(bot.title)
      setEmail(bot.email)
      setJobDescription(bot.jobDescription)
      setSelectedProvider(bot.defaultProvider ?? "")
      setSelectedModel(bot.defaultModel ?? "")
      setGithubToken(bot.githubToken ?? "")
      setSpendingLimit(bot.spendingLimit?.toString() ?? "")
      setAutonomyLevel(bot.autonomyLevel)
      setSupervisedSettings(bot.supervisedSettings)
    } else {
      setTitle("")
      setEmail("")
      setJobDescription("")
      setSelectedProvider("")
      setSelectedModel("")
      setGithubToken("")
      setSpendingLimit("")
      setAutonomyLevel("autonomous")
      setSupervisedSettings(defaultSupervisedSettings)
    }
  }, [bot, open])

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId)
    setSelectedModel("")
  }

  const toggleSupervisedSetting = (key: keyof SupervisedSettings) => {
    setSupervisedSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
      supervisedSettings: autonomyLevel === "supervised" ? supervisedSettings : defaultSupervisedSettings,
      systemPromptId: bot?.systemPromptId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{bot ? "Edit Bot" : "Create Bot"}</DialogTitle>
            <DialogDescription>
              {bot
                ? "Update the bot's configuration."
                : "Define a new AI-powered bot to monitor Jira and interact with repositories."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-5">
            {/* Basic Info */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
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
                <p className="text-[11px] text-muted-foreground">
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
            </div>

            <div className="h-px bg-border" />

            {/* AI Model Selection */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI Model
              </h4>
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
                      <SelectValue placeholder={availableModels.length === 0 ? "No models" : "Select model"} />
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
            </div>

            <div className="h-px bg-border" />

            {/* GitHub & Spending */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Credentials & Limits
              </h4>
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
                  <p className="text-[11px] text-muted-foreground">
                    Dedicated token for this bot
                  </p>
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
                  <p className="text-[11px] text-muted-foreground">
                    Max AI spend per month
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Autonomy Level */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Autonomy Level
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAutonomyLevel("autonomous")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-4 transition-all",
                    autonomyLevel === "autonomous"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <Zap className={cn("size-5", autonomyLevel === "autonomous" ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", autonomyLevel === "autonomous" ? "text-primary" : "text-muted-foreground")}>
                    Autonomous
                  </span>
                  <span className="text-center text-[11px] text-muted-foreground leading-relaxed">
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
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <Eye className={cn("size-5", autonomyLevel === "supervised" ? "text-warning" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", autonomyLevel === "supervised" ? "text-warning" : "text-muted-foreground")}>
                    Supervised
                  </span>
                  <span className="text-center text-[11px] text-muted-foreground leading-relaxed">
                    Bot confirms actions before executing
                  </span>
                </button>
              </div>

              {autonomyLevel === "supervised" && (
                <div className="flex flex-col gap-3 rounded-lg border border-warning/20 bg-warning/5 p-4">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    The bot will confirm actions via channels before doing the activity
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {([
                      { key: "confirmPrCreation" as const, label: "Confirm PR creation" },
                      { key: "confirmPush" as const, label: "Confirm Push" },
                      { key: "confirmJiraComment" as const, label: "Confirm Jira Comment" },
                      { key: "confirmSolution" as const, label: "Confirm Solution" },
                    ]).map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <Checkbox
                          checked={supervisedSettings[key]}
                          onCheckedChange={() => toggleSupervisedSetting(key)}
                        />
                        <span className="text-xs text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {bot ? "Save Changes" : "Create Bot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
