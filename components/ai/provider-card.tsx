"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AIProvider, AllowedAIProvider } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  template: AllowedAIProvider;
  workspaceProvider?: AIProvider | null;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onSave: (id: string, apiKey: string, enabled: boolean) => Promise<void>;
}

export function ProviderCard({ template, workspaceProvider, onToggle, onSave }: ProviderCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [modelsExpanded, setModelsExpanded] = useState(false);
  const [hasModelsOverflow, setHasModelsOverflow] = useState(false);
  const modelsContainerRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState(workspaceProvider?.apiKey ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enabled = workspaceProvider?.enabled ?? false;
  const isConfigured = !!workspaceProvider;

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await onSave(template.id, apiKey.trim(), true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = modelsContainerRef.current;
    if (!el || modelsExpanded) return;
    const check = () => setHasModelsOverflow(el.scrollHeight > el.clientHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [template.models, modelsExpanded]);

  const handleToggle = async (checked: boolean) => {
    if (!workspaceProvider) return;
    setError("");
    try {
      await onToggle(template.id, checked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <div
      className={cn(
        "bg-card rounded-lg border transition-colors",
        enabled ? "border-primary/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-md",
              enabled
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {enabled ? (
              <Check className="size-4" strokeWidth={2.5} />
            ) : (
              <span className="text-xs font-bold">{template.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h3 className="text-card-foreground text-sm font-medium">{template.name}</h3>
            <p className="text-muted-foreground text-xs">
              {template.models.length} model
              {template.models.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConfigured && (
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={!isConfigured} />
          )}
        </div>
      </div>

      <div className="border-border border-t px-4 py-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter API key…"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError("");
                }}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                <span className="sr-only">{showKey ? "Hide" : "Show"} API key</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving…" : "Save"}
              </Button>
            </div>
            {error && <p className="text-destructive text-xs">{error}</p>}
            <p className="text-muted-foreground text-[11px]">
              Your key is stored securely. Leave empty for local providers like Ollama.
            </p>
          </div>

          {template.models.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Available models</Label>
              <div
                ref={modelsContainerRef}
                className={cn(
                  "flex flex-wrap gap-1.5",
                  modelsExpanded ? "max-h-40 overflow-y-auto" : "max-h-14 overflow-hidden",
                )}
              >
                {template.models.map((model) => (
                  <span
                    key={model.id}
                    className="border-border bg-muted/50 rounded border px-2 py-1 font-mono text-[11px]"
                  >
                    {model.name}
                  </span>
                ))}
              </div>
              {(hasModelsOverflow || modelsExpanded) && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs font-normal"
                  onClick={() => setModelsExpanded(!modelsExpanded)}
                >
                  {modelsExpanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
