"use client";

import { ProviderModelCard } from "@/components/ai/provider-model-card";
import { ALLOWED_AI_PROVIDERS } from "@/lib/constants/allowed-ai-providers";
import type { FormState, FieldErrors } from "./types";
import type { AIProvider } from "@/lib/types";

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
  const providerMap = new Map(providers.map((p) => [p.slug, p]));

  const handleSelect = (templateSlug: string) => {
    const wp = providerMap.get(templateSlug);
    const providerId = wp?.id ?? `${workspaceId}-${templateSlug}`;
    const isCurrentlySelected = form.selectedProvider === providerId;
    onProviderChange(isCurrentlySelected ? "" : providerId);
    onClearError("selectedProvider");
    onClearError("selectedModel");
  };

  const handleSave = async (slug: string, apiKey: string, enabled: boolean) => {
    if (onAiSave) {
      await onAiSave(slug, apiKey, enabled);
      onAiProvidersChange?.();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Provider & model ({ALLOWED_AI_PROVIDERS.length})
          </h4>
          <p className="text-muted-foreground/70 text-xs">
            Select a provider and model for this bot.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
          {ALLOWED_AI_PROVIDERS.map((template) => {
            const workspaceProvider = providerMap.get(template.slug);
            const providerId = workspaceProvider?.id ?? `${workspaceId}-${template.slug}`;
            const isSelected = form.selectedProvider === providerId;
            const isThisProviderSelected = form.selectedProvider === providerId;

            return (
              <ProviderModelCard
                key={template.slug}
                template={template}
                workspaceProvider={workspaceProvider}
                isSelected={isSelected}
                selectedModel={isThisProviderSelected ? form.selectedModel : ""}
                spendingLimit={isThisProviderSelected ? form.spendingLimit : ""}
                onSelect={() => handleSelect(template.slug)}
                onModelChange={(v) => {
                  onFormChange((prev) => ({ ...prev, selectedModel: v }));
                  onClearError("selectedModel");
                }}
                onSpendingLimitChange={(v) => {
                  onFormChange((prev) => ({ ...prev, spendingLimit: v }));
                  onClearError("spendingLimit");
                }}
                onSave={handleSave}
                onSaveSuccess={onAiProvidersChange}
                errors={
                  isThisProviderSelected
                    ? {
                        selectedModel: errors.selectedModel,
                        spendingLimit: errors.spendingLimit,
                      }
                    : {}
                }
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
