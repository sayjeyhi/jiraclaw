"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AiProviderEditDialog } from "@/components/ai/ai-provider-edit-dialog";
import { AiProviderConfigureDialog } from "@/components/ai/ai-provider-configure-dialog";
import { ALLOWED_AI_PROVIDERS } from "@/lib/constants/allowed-ai-providers";
import type { FormState, FieldErrors } from "./types";
import type { AIProvider, AllowedAIProvider } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepAIModelProps {
  form: FormState;
  errors: FieldErrors;
  providers: AIProvider[];
  workspaceId: string;
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onProviderChange: (providerId: string) => void;
  onClearError: (field: string) => void;
  onAiSave?: (slug: string, apiKey: string, enabled: boolean) => Promise<void>;
  onAiProvidersChange?: () => void;
}

export function StepAIModel({
  form,
  errors,
  providers,
  workspaceId,
  onFormChange,
  onProviderChange,
  onClearError,
  onAiSave,
  onAiProvidersChange,
}: StepAIModelProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<{
    provider: AIProvider;
    template: AllowedAIProvider;
  } | null>(null);

  const providerMap = new Map(providers.map((p) => [p.slug, p]));
  const configuredSlugs = ALLOWED_AI_PROVIDERS.filter((template) => {
    const wp = providerMap.get(template.slug);
    return wp && wp.enabled;
  }).map((t) => t.slug);
  const configuredProviders = ALLOWED_AI_PROVIDERS.filter((template) =>
    configuredSlugs.includes(template.slug),
  );

  const handleSelect = (providerId: string) => {
    onProviderChange(providerId);
    onClearError("selectedProvider");
    onClearError("selectedModel");
  };

  const openEditDialog = (provider: AIProvider, template: AllowedAIProvider) => {
    setEditingProvider({ provider, template });
    setEditDialogOpen(true);
  };

  const handleEditSave = async (slug: string, apiKey: string, enabled: boolean) => {
    if (onAiSave) {
      await onAiSave(slug, apiKey, enabled);
      onAiProvidersChange?.();
    }
    setEditDialogOpen(false);
    setEditingProvider(null);
  };

  const handleConfigureSave = async (slug: string, apiKey: string, enabled: boolean) => {
    if (onAiSave) {
      await onAiSave(slug, apiKey, enabled);
      onAiProvidersChange?.();
    }
    setConfigureDialogOpen(false);
  };

  const selectedProvider = form.selectedProvider
    ? (providers.find((p) => p.id === form.selectedProvider) ??
      (() => {
        const slug = form.selectedProvider?.startsWith(workspaceId + "-")
          ? form.selectedProvider.slice(workspaceId.length + 1)
          : form.selectedProvider;
        return slug ? (providerMap.get(slug) ?? null) : null;
      })())
    : null;
  const selectedTemplate = selectedProvider
    ? ALLOWED_AI_PROVIDERS.find((t) => t.slug === selectedProvider.slug)
    : null;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 border-b pb-3">
          <div>
            <h4 className="text-foreground text-base font-medium tracking-wider uppercase">
              Provider & model
            </h4>
            <p className="text-muted-foreground/70 text-xs">
              Select a configured AI provider and model for this bot.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfigureDialogOpen(true)}
          >
            <Plus className="mr-1.5 size-3.5" />
            Configure Provider
          </Button>
        </div>

        {configuredProviders.length === 0 ? (
          <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground text-sm">No AI providers configured.</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Add your first provider to get started.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setConfigureDialogOpen(true)}
            >
              <Plus className="mr-1.5 size-3.5" />
              Configure Provider
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium">Provider</Label>
            <RadioGroup
              value={form.selectedProvider}
              onValueChange={handleSelect}
              className="grid gap-2 sm:grid-cols-2"
            >
              {configuredProviders.map((template) => {
                const wp = providerMap.get(template.slug)!;
                const providerId = wp.id;
                const isSelected = form.selectedProvider === providerId;

                return (
                  <div
                    key={template.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(providerId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(providerId);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 ring-primary/20 ring-1"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <RadioGroupItem
                      value={providerId}
                      id={`provider-${template.slug}`}
                      className="shrink-0"
                    />
                    <label
                      htmlFor={`provider-${template.slug}`}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-md",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-green-600/20 text-green-600 dark:bg-green-400",
                        )}
                      >
                        <Check className="size-4" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{template.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {template.models.length} models available
                        </p>
                      </div>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(wp, template);
                      }}
                      aria-label={`Edit ${template.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </RadioGroup>
            {errors.selectedProvider && (
              <p className="text-destructive text-xs">{errors.selectedProvider}</p>
            )}

            {selectedProvider && selectedTemplate && (
              <div className="border-border mt-4 flex flex-col gap-4 rounded-lg border p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="model-select">Model</Label>
                  <Select
                    value={form.selectedModel}
                    onValueChange={(v) => {
                      onFormChange((prev) => ({ ...prev, selectedModel: v }));
                      onClearError("selectedModel");
                    }}
                  >
                    <SelectTrigger
                      id="model-select"
                      className={cn(errors.selectedModel && "border-destructive")}
                    >
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTemplate.models.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.selectedModel && (
                    <p className="text-destructive text-xs">{errors.selectedModel}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="spending-limit">Spending Limit (USD/mo)</Label>
                  <Input
                    id="spending-limit"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 100"
                    value={form.spendingLimit}
                    onChange={(e) => {
                      onFormChange((prev) => ({ ...prev, spendingLimit: e.target.value }));
                      onClearError("spendingLimit");
                    }}
                    className={cn(errors.spendingLimit && "border-destructive")}
                  />
                  {errors.spendingLimit ? (
                    <p className="text-destructive text-xs">{errors.spendingLimit}</p>
                  ) : (
                    <p className="text-muted-foreground text-xs">Max AI spend per month</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AiProviderConfigureDialog
        open={configureDialogOpen}
        onOpenChange={setConfigureDialogOpen}
        configuredSlugs={configuredSlugs}
        providerMap={providerMap}
        onSave={handleConfigureSave}
      />

      {editingProvider && (
        <AiProviderEditDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingProvider(null);
          }}
          provider={editingProvider.provider}
          template={editingProvider.template}
          onSave={handleEditSave}
        />
      )}
    </>
  );
}
