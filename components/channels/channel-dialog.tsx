"use client";

import { useState, useEffect } from "react";
import { Radio, KeyRound } from "lucide-react";
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
  }) => void;
}

const STEPS = [
  { id: 1, label: "Select provider", icon: Radio },
  { id: 2, label: "Configure", icon: KeyRound },
] as const;

export function ChannelDialog({ open, onOpenChange, existingSlugs, onSave }: ChannelDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableProviders = CHANNEL_PROVIDERS.filter((p) => !existingSlugs.includes(p.slug));
  const selectedProvider = selectedSlug ? getChannelProvider(selectedSlug) : null;

  useEffect(() => {
    if (!open) {
      setStep(1);
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

  const handleNext = () => {
    if (step === 1) {
      if (!selectedSlug) {
        setErrors({ provider: "Select a channel provider" });
        return;
      }
      const provider = getChannelProvider(selectedSlug);
      if (provider && provider.credentials.length === 0) {
        // No config needed, save immediately
        onSave({
          name: provider.name,
          slug: provider.slug,
          icon: provider.icon,
          credentials: {},
        });
        onOpenChange(false);
        return;
      }
      setStep(2);
      setErrors({});
    } else {
      // Step 2: validate and save
      const provider = getChannelProvider(selectedSlug!);
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

      onSave({
        name: provider.name,
        slug: provider.slug,
        icon: provider.icon,
        credentials: { ...credentials },
      });
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setStep(1);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Channel</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Choose a communication channel to add to your workspace."
              : `Configure ${selectedProvider?.name ?? ""} credentials.`}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator - same design as bot dialog */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-center gap-1">
                  {i > 0 && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        isCompleted || isCurrent ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2 transition-all",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary/10 text-primary",
                      !isCurrent && !isCompleted && "border-border text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        isCompleted ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="grid max-h-75 grid-cols-2 gap-2 overflow-y-auto py-2">
            {availableProviders.length === 0 ? (
              <p className="text-muted-foreground col-span-2 py-8 text-center text-sm">
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
        )}

        {step === 2 && selectedProvider && (
          <div className="flex flex-col gap-4 py-2">
            {selectedProvider.credentials.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No configuration required for {selectedProvider.name}.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedProvider.credentials.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <Label className="text-sm">
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
            )}
          </div>
        )}

        {step === 1 && errors.provider && (
          <p className="text-destructive text-sm">{errors.provider}</p>
        )}

        <DialogFooter>
          {step === 2 ? (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                {selectedProvider?.credentials.length === 0 ? "Add Channel" : "Add Channel"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              disabled={availableProviders.length === 0 || !selectedSlug}
            >
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
