"use client";

import { useState, useEffect, useCallback } from "react";
import { DownloadIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import type { SkillItem } from "@/lib/skills-data";
import { cn } from "@/lib/utils";

const MAX_SKILLS = parseInt(process.env.MAX_SKILLS_PER_BOT!, 10) || 5;

interface SkillsCardPickerProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function SkillsCardPicker({ value, onChange, error, disabled }: SkillsCardPickerProps) {
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchSkills = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      const data = await api.skills.search(q || undefined);
      setSkills(Array.isArray(data) ? data : []);
    } catch {
      setSkills([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchSkills(query), 200);
    return () => clearTimeout(t);
  }, [query, searchSkills]);

  const toggleSkill = (skill: SkillItem) => {
    if (disabled) return;
    if (value.includes(skill.id)) {
      onChange(value.filter((id) => id !== skill.id));
    } else if (value.length < MAX_SKILLS) {
      onChange([...value, skill.id]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search skills (language, framework, ...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          className={cn(
            "bg-muted/40 pl-9 placeholder:text-xs",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center text-sm">Loading skills...</div>
      ) : skills.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
          {query ? "No skills found. Try a different search." : "Type to search skills..."}
        </div>
      ) : (
        <div className="relative max-h-64">
          <div className="dark:from-card pointer-events-none absolute -top-0.5 right-3 left-0 z-10 h-4 w-full bg-linear-to-b from-white to-transparent"></div>

          <div className="grid max-h-64 gap-2 overflow-auto overflow-y-auto py-2 pr-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => {
              const isChecked = value.includes(skill.id);
              const isDisabled = !isChecked && value.length >= MAX_SKILLS;

              return (
                <label
                  key={skill.id}
                  className={cn(
                    "border-border bg-card hover:border-primary/30 flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors",
                    isChecked && "border-primary bg-primary/5",
                    isDisabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    disabled={isDisabled}
                    onCheckedChange={() => toggleSkill(skill)}
                    className="mx-1.5 shrink-0 scale-125"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-card-foreground text-sm font-medium">{skill.name}</span>
                    <p className="text-muted-foreground -mt-0.5 mb-0.5 truncate text-xs">
                      {skill.repo}
                    </p>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
                      <DownloadIcon className="text-muted-foreground size-3 shrink-0 opacity-50" />
                      {skill.installs} installs
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="dark:from-card pointer-events-none absolute right-3 -bottom-0.5 left-0 z-10 h-5 w-full bg-linear-to-t from-white to-transparent"></div>
        </div>
      )}

      {error && <p className="text-destructive text-[10px]">{error}</p>}
    </div>
  );
}
