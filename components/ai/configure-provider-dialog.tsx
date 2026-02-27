"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AllowedAIProvider } from "@/lib/types";
import { api } from "@/lib/api";

interface ConfigureProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: AllowedAIProvider[];
  workspaceId: string;
  onSuccess: (id: string, apiKey: string) => void;
}

export function ConfigureProviderDialog({
  open,
  onOpenChange,
  providers,
  workspaceId,
  onSuccess,
}: ConfigureProviderDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<AllowedAIProvider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiForWorkspace = api.forWorkspace(workspaceId);

  const reset = () => {
    setStep(1);
    setSelected(null);
    setApiKey("");
    setShowKey(false);
    setError("");
    setLoading(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handlePick = (provider: AllowedAIProvider) => {
    setSelected(provider);
    setApiKey(provider.apiKey ?? "");
    setError("");
    setStep(2);
  };

  const handleSave = async () => {
    if (!selected) return;
    setError("");
    setLoading(true);
    try {
      await apiForWorkspace.aiModels.update(selected.id, {
        apiKey: apiKey.trim(),
        enabled: true,
      });
      onSuccess(selected.id, apiKey.trim());
      handleOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Step indicator */}
        <div className="mb-1 flex items-center gap-1.5 text-xs">
          <span
            className={cn("font-medium", step === 1 ? "text-foreground" : "text-muted-foreground")}
          >
            1. Select provider
          </span>
          <span className="text-muted-foreground/40">→</span>
          <span
            className={cn("font-medium", step === 2 ? "text-foreground" : "text-muted-foreground")}
          >
            2. Configure API key
          </span>
        </div>

        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Select a provider</DialogTitle>
              <DialogDescription>
                Choose an AI provider to configure for your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto py-1 pr-1">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handlePick(provider)}
                  className={cn(
                    "hover:bg-accent flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                    "border-border",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                      "bg-muted text-muted-foreground",
                    )}
                  >
                    {provider.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{provider.name}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {provider.models.length} model{provider.models.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && selected && (
          <>
            <DialogHeader>
              <div className="mb-1 flex items-center gap-3">
                <div className="bg-primary/15 text-primary flex size-9 items-center justify-center rounded-md text-sm font-bold">
                  {selected.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <DialogTitle>{selected.name}</DialogTitle>
                  <DialogDescription className="mt-0.5">
                    {selected.models.length} model{selected.models.length !== 1 ? "s" : ""}{" "}
                    available
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="provider-api-key">API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="provider-api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="Enter your API key…"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (error) setError("");
                    }}
                    className="font-mono text-xs"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    <span className="sr-only">{showKey ? "Hide" : "Show"} key</span>
                  </Button>
                </div>
                {error && <p className="text-destructive text-[11px]">{error}</p>}
                <p className="text-muted-foreground text-[11px]">
                  Your key is stored securely. Leave empty for local providers like Ollama.
                </p>
              </div>

              {selected.models.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs">Available models</Label>
                  <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                    {selected.models.map((model) => (
                      <span
                        key={model.id}
                        className="border-border bg-muted/50 rounded border px-2 py-1 font-mono text-[11px]"
                      >
                        {model.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
                className="gap-1.5"
              >
                <ChevronLeft className="size-3.5" />
                Back
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving…" : "Save & Enable"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
