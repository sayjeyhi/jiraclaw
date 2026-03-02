"use client";

import { useState } from "react";
import { Eye, EyeOff, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AIProvider } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: AIProvider;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdateApiKey: (id: string, apiKey: string) => void;
}

export function ProviderCard({ provider, onToggle, onUpdateApiKey }: ProviderCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(provider.apiKey ?? "");

  return (
    <div
      className={cn(
        "bg-card rounded-lg border transition-colors",
        provider.enabled ? "border-primary/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-xs font-bold",
              provider.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            {provider.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-card-foreground text-sm font-medium">{provider.name}</h3>
            {provider.models.length > 0 && (
              <p className="text-muted-foreground text-xs">
                {provider.models.length} model{provider.models.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {provider.apiKey && (
            <Badge variant="outline" className="text-success border-success/25 text-[10px]">
              <Key className="mr-1 size-2.5" />
              Configured
            </Badge>
          )}
          <Switch
            checked={provider.enabled}
            onCheckedChange={(checked) => onToggle(provider.id, checked)}
          />
        </div>
      </div>

      <div className="border-border border-t px-4 py-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
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
                onClick={() => onUpdateApiKey(provider.id, apiKey)}
              >
                Save
              </Button>
            </div>
          </div>

          {provider.models.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Available Models</Label>
              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {provider.models.map((model) => (
                  <div
                    key={model.id}
                    className="border-border bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-1.5"
                  >
                    <span className="text-foreground font-mono text-xs">{model.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {(model.maxTokens / 1000).toFixed(0)}k tokens
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
