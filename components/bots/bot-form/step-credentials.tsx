"use client";

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FormState, FieldErrors } from "./types";

interface StepCredentialsProps {
  form: FormState;
  errors: FieldErrors;
  showToken: boolean;
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onToggleShowToken: () => void;
  onClearError: (field: string) => void;
}

export function StepCredentials({
  form,
  errors,
  showToken,
  onFormChange,
  onToggleShowToken,
  onClearError,
}: StepCredentialsProps) {
  return (
    <>
      <p className="text-muted-foreground text-xs">
        Optionally provide a dedicated GitHub token for this bot. You can add it later.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="github-token">GitHub Token</Label>
        <div className="flex items-center gap-2">
          <Input
            id="github-token"
            type={showToken ? "text" : "password"}
            placeholder="ghp_..."
            value={form.githubToken}
            onChange={(e) => {
              onFormChange((prev) => ({ ...prev, githubToken: e.target.value }));
              onClearError("githubToken");
            }}
            aria-invalid={!!errors.githubToken}
            className={cn(
              errors.githubToken && "border-destructive focus-visible:ring-destructive",
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={onToggleShowToken}
          >
            {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            <span className="sr-only">{showToken ? "Hide" : "Show"} token</span>
          </Button>
        </div>
        {errors.githubToken ? (
          <p className="text-destructive text-[11px]">{errors.githubToken}</p>
        ) : (
          <p className="text-muted-foreground text-[11px]">Dedicated token for this bot</p>
        )}
      </div>
    </>
  );
}
