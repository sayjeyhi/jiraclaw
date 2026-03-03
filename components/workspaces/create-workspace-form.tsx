"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createWorkspace } from "@/app/actions/workspace";
import { ArrowRight, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});

type FieldErrors = Record<string, string>;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface CreateWorkspaceFormProps {
  onSuccess: (workspaceId: string) => void;
}

export function CreateWorkspaceForm({ onSuccess }: CreateWorkspaceFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(toSlug(value));
    if (errors.name)
      setErrors((e) => {
        const n = { ...e };
        delete n.name;
        return n;
      });
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
    if (errors.slug)
      setErrors((e) => {
        const n = { ...e };
        delete n.slug;
        return n;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = schema.safeParse({ name, slug });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v[0]])));
      return;
    }

    setLoading(true);
    try {
      const workspace = await createWorkspace(name, slug);
      onSuccess(workspace.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrors({ slug: message.includes("slug") ? "This slug is already taken" : message });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          placeholder="Acme Corp"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          autoFocus
          aria-invalid={!!errors.name}
          className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.name && <p className="text-destructive text-[10px]">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ws-slug">URL slug</Label>
        <div className="flex items-center">
          <span className="border-border bg-muted text-muted-foreground flex h-9 items-center rounded-l-md border border-r-0 px-3 text-sm">
            jiraclaw.ai/w/
          </span>
          <Input
            id="ws-slug"
            placeholder="acme-corp"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            aria-invalid={!!errors.slug}
            className={cn(
              "rounded-l-none",
              errors.slug && "border-destructive focus-visible:ring-destructive",
            )}
          />
        </div>
        {errors.slug ? (
          <p className="text-destructive text-[10px]">{errors.slug}</p>
        ) : (
          <p className="text-muted-foreground text-[10px]">
            Only lowercase letters, numbers, and hyphens
          </p>
        )}
      </div>

      <Button type="submit" className="mt-2 h-11 gap-2" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {loading ? "Creating workspace…" : "Create workspace"}
      </Button>
    </form>
  );
}
