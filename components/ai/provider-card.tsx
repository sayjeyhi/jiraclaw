"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  onSave: (slug: string, apiKey: string, enabled: boolean) => Promise<void>;
}

export function ProviderCard({ template, workspaceProvider, onToggle, onSave }: ProviderCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [modelsExpanded, setModelsExpanded] = useState(false);
  const [hasModelsOverflow, setHasModelsOverflow] = useState(false);
  const modelsContainerRef = useRef<HTMLDivElement>(null);
  const savedMasked = workspaceProvider?.apiKey ?? ""; // API returns masked (first 2 + last 3)
  const [apiKey, setApiKey] = useState(savedMasked);

  useEffect(() => {
    setApiKey(savedMasked);
  }, [savedMasked]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enabled = workspaceProvider?.enabled ?? false;
  const isConfigured = !!workspaceProvider;

  const hasChanges = apiKey !== savedMasked;
  const canSave = hasChanges && (apiKey.trim().length > 0 || savedMasked.length > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    setLoading(true);
    try {
      await onSave(template.slug, apiKey.trim(), true);
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
      await onToggle(workspaceProvider.id, checked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200",
        enabled
          ? "border-green-500 bg-green-500/5 shadow-sm ring-2 ring-green-500/20"
          : "border-border bg-card opacity-75 hover:opacity-90",
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-md",
              enabled ? "bg-green-600/60 text-white" : "bg-muted text-muted-foreground",
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
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>

          {template.models.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Available models</Label>
              <div
                ref={modelsContainerRef}
                className={cn(
                  "flex flex-wrap gap-1.5",
                  modelsExpanded ? "max-h-42 overflow-y-auto" : "max-h-15 overflow-hidden",
                )}
              >
                {template.models.map((model) => (
                  <span
                    key={model.id}
                    className="border-border bg-muted/40 rounded border px-2 py-1 font-mono text-[10px] opacity-65 transition-opacity duration-200 select-none hover:opacity-100"
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
