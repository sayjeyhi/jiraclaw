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
import type { AIProvider, AllowedAIProvider } from "@/lib/types";

interface AiProviderEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: AIProvider;
  template: AllowedAIProvider;
  onSave: (slug: string, apiKey: string, enabled: boolean) => void | Promise<void>;
}

export function AiProviderEditDialog({
  open,
  onOpenChange,
  provider,
  template,
  onSave,
}: AiProviderEditDialogProps) {
  const [apiKey, setApiKey] = useState(provider.apiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setApiKey(provider.apiKey ?? "");
      setError("");
    }
  }, [open, provider.apiKey]);

  const savedMasked = provider.apiKey ?? "";
  const hasChanges = apiKey !== savedMasked;
  const canSave = hasChanges && (apiKey.trim().length > 0 || savedMasked.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSave(template.slug, apiKey.trim(), provider.enabled);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {template.name}</DialogTitle>
          <DialogDescription>Update the API key for this AI provider.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
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
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave || isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
