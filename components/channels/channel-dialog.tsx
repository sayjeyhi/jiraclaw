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
import { CHANNEL_PROVIDERS, getChannelProvider } from "@/lib/channel-providers";
import { iconMap } from "./channel-icons";
import { cn } from "@/lib/utils";

interface ChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSlugs: string[];
  onSave: (data: {
    name: string;
    slug: string;
    icon: string;
    credentials: Record<string, string>;
  }) => void | Promise<void>;
}

export function ChannelDialog({ open, onOpenChange, existingSlugs, onSave }: ChannelDialogProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableProviders = CHANNEL_PROVIDERS.filter((p) => !existingSlugs.includes(p.slug));
  const selectedProvider = selectedSlug ? getChannelProvider(selectedSlug) : null;

  useEffect(() => {
    if (!open) {
      setSelectedSlug(null);
      setCredentials({});
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (selectedSlug) {
      const provider = getChannelProvider(selectedSlug);
      if (provider) {
        const initial: Record<string, string> = {};
        for (const f of provider.credentials) {
          initial[f.key] = "";
        }
        setCredentials(initial);
      } else {
        setCredentials({});
      }
    } else {
      setCredentials({});
    }
  }, [selectedSlug]);

  const handleSelectProvider = (slug: string) => {
    setSelectedSlug(slug);
    setErrors({});
  };

  const updateCredential = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug) {
      setErrors({ provider: "Select a channel provider" });
      return;
    }

    const provider = getChannelProvider(selectedSlug);
    if (!provider) return;

    const newErrors: Record<string, string> = {};
    for (const f of provider.credentials) {
      if (f.required && !credentials[f.key]?.trim()) {
        newErrors[f.key] = `${f.label} is required`;
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: provider.name,
        slug: provider.slug,
        icon: provider.icon,
        credentials: { ...credentials },
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Channel</DialogTitle>
          <DialogDescription>
            Choose a communication channel and configure its credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Provider</Label>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">
              {availableProviders.length === 0 ? (
                <p className="text-muted-foreground col-span-2 py-6 text-center text-sm">
                  All channel types have been added. Remove one to add it again.
                </p>
              ) : (
                availableProviders.map((provider) => {
                  const Icon = iconMap[provider.icon as keyof typeof iconMap];
                  const isSelected = selectedSlug === provider.slug;
                  return (
                    <button
                      key={provider.slug}
                      type="button"
                      onClick={() => handleSelectProvider(provider.slug)}
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
                        {Icon ? <Icon className="size-5" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{provider.name}</p>
                        {provider.description && (
                          <p className="text-muted-foreground truncate text-xs">
                            {provider.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {errors.provider && <p className="text-destructive text-xs">{errors.provider}</p>}
          </div>

          {selectedProvider && selectedProvider.credentials.length > 0 && (
            <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
              <Label className="text-sm font-medium">Credentials</Label>
              <div className="flex flex-col gap-3">
                {selectedProvider.credentials.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <Label className="text-xs font-normal">
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                    </Label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={credentials[field.key] ?? ""}
                      onChange={(e) => updateCredential(field.key, e.target.value)}
                      className={errors[field.key] ? "border-destructive" : ""}
                    />
                    {errors[field.key] && (
                      <p className="text-destructive text-xs">{errors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
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
              {isSubmitting ? "Adding..." : "Add Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
