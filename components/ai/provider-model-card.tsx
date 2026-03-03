"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AIProvider, AllowedAIProvider } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProviderModelCardProps {
  template: AllowedAIProvider;
  workspaceProvider?: AIProvider | null;
  isSelected: boolean;
  selectedModel: string;
  spendingLimit: string;
  onSelect: () => void;
  onModelChange: (modelId: string) => void;
  onSpendingLimitChange: (value: string) => void;
  onSave: (slug: string, apiKey: string, enabled: boolean) => Promise<void>;
  onSaveSuccess?: () => void;
  errors?: { selectedModel?: string; spendingLimit?: string };
}

export function ProviderModelCard({
  template,
  workspaceProvider,
  isSelected,
  selectedModel,
  spendingLimit,
  onSelect,
  onModelChange,
  onSpendingLimitChange,
  onSave,
  onSaveSuccess,
  errors = {},
}: ProviderModelCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const savedMasked = workspaceProvider?.apiKey ?? "";
  const [apiKey, setApiKey] = useState(savedMasked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setApiKey(savedMasked);
  }, [savedMasked]);

  const enabled = workspaceProvider?.enabled ?? false;
  const isConfigured = !!workspaceProvider;
  const hasChanges = apiKey !== savedMasked;
  const canSave = !isConfigured
    ? true
    : hasChanges && (apiKey.trim().length > 0 || savedMasked.length > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    setLoading(true);
    try {
      await onSave(template.slug, apiKey.trim(), true);
      onSaveSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5 ring-primary/20 shadow-sm ring-2"
          : "border-border bg-card hover:border-primary/30 opacity-85 hover:opacity-100",
        !isConfigured && isSelected && "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="hover:bg-muted/30 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            isSelected
              ? "bg-primary text-primary-foreground"
              : enabled
                ? "bg-green-600/20 text-green-600 dark:text-green-400"
                : "bg-muted text-muted-foreground",
          )}
        >
          {enabled ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : (
            <span className="text-xs font-bold">{template.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-card-foreground text-sm font-medium">{template.name}</h3>
          <p className="text-muted-foreground truncate text-[10px]">
            {isSelected && selectedModel
              ? (template.models.find((m) => m.id === selectedModel)?.name ?? "Select model")
              : isConfigured
                ? `${template.models.length} models`
                : "Configure API key to use"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isSelected ? (
            <ChevronDown className="text-muted-foreground size-4" />
          ) : (
            <ChevronRight className="text-muted-foreground size-4" />
          )}
        </div>
      </button>

      {isSelected && (
        <div className="border-border flex flex-col gap-4 border-t px-4 py-4">
          {/* API Key */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs">API Key</Label>
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Tooltip open={inputFocused}>
                  <TooltipTrigger asChild>
                    <Input
                      type="text"
                      placeholder="Enter API key…"
                      autoComplete="off"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setError("");
                      }}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      className="pr-9 font-mono text-xs"
                      style={
                        !showKey && apiKey
                          ? ({
                              WebkitTextSecurity: "disc",
                              textSecurity: "disc",
                            } as React.CSSProperties)
                          : undefined
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>Your key is stored securely. Leave empty for local providers like Ollama.</p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-0 size-8 shrink-0 -translate-y-1/2"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  <span className="sr-only">{showKey ? "Hide" : "Show"} API key</span>
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={loading || !canSave}
              >
                {loading
                  ? isConfigured
                    ? "Updating…"
                    : "Saving…"
                  : isConfigured
                    ? "Update"
                    : "Save"}
              </Button>
            </div>
            {error ? (
              <p className="text-destructive text-[10px]">{error}</p>
            ) : (
              !isConfigured && (
                <p className="text-muted-foreground text-[10px]">
                  Save your API key to enable this provider, or leave empty for local providers like
                  Ollama.
                </p>
              )
            )}
          </div>

          {/* Model & Spending - when configured */}
          {isConfigured && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`model-${template.slug}`}>Model</Label>
                <Select value={selectedModel} onValueChange={onModelChange}>
                  <SelectTrigger
                    id={`model-${template.slug}`}
                    className={cn(errors.selectedModel && "border-destructive")}
                  >
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {template.models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedModel && (
                  <p className="text-destructive text-[10px]">{errors.selectedModel}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`spending-${template.slug}`}>Spending Limit (USD/mo)</Label>
                <Input
                  id={`spending-${template.slug}`}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 100"
                  value={spendingLimit}
                  onChange={(e) => onSpendingLimitChange(e.target.value)}
                  className={cn(errors.spendingLimit && "border-destructive")}
                />
                {errors.spendingLimit ? (
                  <p className="text-destructive text-[10px]">{errors.spendingLimit}</p>
                ) : (
                  <p className="text-muted-foreground text-[10px]">Max AI spend per month</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
