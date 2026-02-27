"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FormState, FieldErrors } from "./types";
import type { AIProvider } from "@/lib/types";

interface StepAIModelProps {
  form: FormState;
  errors: FieldErrors;
  enabledProviders: AIProvider[];
  availableModels: { id: string; name: string }[];
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onProviderChange: (providerId: string) => void;
  onClearError: (field: string) => void;
}

export function StepAIModel({
  form,
  errors,
  enabledProviders,
  availableModels,
  onFormChange,
  onProviderChange,
  onClearError,
}: StepAIModelProps) {
  return (
    <>
      <p className="text-muted-foreground text-xs">
        Choose an AI provider and model for this bot. You can skip this and configure it later.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="provider">Provider</Label>
          <Select value={form.selectedProvider} onValueChange={onProviderChange}>
            <SelectTrigger className="w-full" id="provider">
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
            value={form.selectedModel}
            onValueChange={(v) => {
              onFormChange((prev) => ({ ...prev, selectedModel: v }));
              onClearError("selectedModel");
            }}
            disabled={!form.selectedProvider || availableModels.length === 0}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                errors.selectedModel && "border-destructive focus-visible:ring-destructive",
              )}
              id="model"
            >
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
          {errors.selectedModel && (
            <p className="text-destructive text-[11px]">{errors.selectedModel}</p>
          )}
        </div>
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
          aria-invalid={!!errors.spendingLimit}
          className={cn(
            errors.spendingLimit && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.spendingLimit ? (
          <p className="text-destructive text-[11px]">{errors.spendingLimit}</p>
        ) : (
          <p className="text-muted-foreground text-[11px]">Max AI spend per month</p>
        )}
      </div>
    </>
  );
}
