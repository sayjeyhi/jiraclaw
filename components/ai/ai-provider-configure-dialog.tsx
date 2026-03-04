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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ALLOWED_AI_PROVIDERS } from "@/lib/constants/allowed-ai-providers";
import type { AIProvider } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AiProviderConfigureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configuredSlugs: string[];
  providerMap: Map<string, AIProvider>;
  onSave: (slug: string, apiKey: string, enabled: boolean) => void | Promise<void>;
}

export function AiProviderConfigureDialog({
  open,
  onOpenChange,
  configuredSlugs,
  providerMap,
  onSave,
}: AiProviderConfigureDialogProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableProviders = ALLOWED_AI_PROVIDERS.filter((p) => !configuredSlugs.includes(p.slug));
  const selectedTemplate = selectedSlug
    ? ALLOWED_AI_PROVIDERS.find((t) => t.slug === selectedSlug)
    : null;

  useEffect(() => {
    if (!open) {
      setSelectedSlug(null);
      setApiKey("");
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (selectedSlug) {
      const wp = providerMap.get(selectedSlug);
      setApiKey(wp?.apiKey ?? "");
    } else {
      setApiKey("");
    }
  }, [selectedSlug, providerMap]);

  const handleSelectProvider = (slug: string) => {
    setSelectedSlug(slug);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug || !selectedTemplate) {
      setError("Select a provider");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSave(selectedSlug, apiKey.trim(), true);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure Provider</DialogTitle>
          <DialogDescription>
            Choose an AI provider and add your API key to enable it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Provider</Label>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">
              {availableProviders.length === 0 ? (
                <p className="text-muted-foreground col-span-2 py-6 text-center text-sm">
                  All AI providers are configured. Edit one from the list to update credentials.
                </p>
              ) : (
                availableProviders.map((template) => {
                  const isSelected = selectedSlug === template.slug;

                  return (
                    <button
                      key={template.slug}
                      type="button"
                      onClick={() => handleSelectProvider(template.slug)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5 ring-primary/20 ring-1"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-md",
                          isSelected
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <span className="text-xs font-bold">
                          {template.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{template.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {template.models.length} models
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {error && !selectedTemplate && <p className="text-destructive text-xs">{error}</p>}
          </div>

          {selectedTemplate && (
            <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
              <Label className="text-sm font-medium">API Key</Label>
              <div className="relative">
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
              {error && selectedTemplate && <p className="text-destructive text-xs">{error}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={availableProviders.length === 0 || !selectedSlug || isSubmitting}
            >
              {isSubmitting ? "Configuring…" : "Configure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
