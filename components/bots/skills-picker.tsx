"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { SkillItem } from "@/lib/skills-data";
import { cn } from "@/lib/utils";

const MAX_SKILLS = 10;
const SKILLS_URL = "https://skills.sh";

interface SkillsPickerProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function SkillsPicker({ value, onChange, error, disabled }: SkillsPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SkillItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchSkills = useCallback(async (q: string) => {
    setIsSearching(true);
    try {
      const data = await api.skills.search(q);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchSkills(query), 200);
    return () => clearTimeout(t);
  }, [query, searchSkills]);

  const addSkill = (skill: SkillItem) => {
    if (value.includes(skill.id) || value.length >= MAX_SKILLS) return;
    onChange([...value, skill.id]);
    setQuery("");
    setIsOpen(false);
  };

  const removeSkill = (id: string) => {
    onChange(value.filter((s) => s !== id));
  };

  const filteredResults = results.filter((r) => !value.includes(r.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search skills from skills.sh..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          disabled={disabled}
          className={cn("pl-9", error && "border-destructive focus-visible:ring-destructive")}
        />
        {isOpen && (query || !value.length) && (
          <div className="border-border bg-popover absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-lg">
            {isSearching ? (
              <div className="text-muted-foreground p-4 text-center text-sm">Searching...</div>
            ) : filteredResults.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                {query ? "No skills found. Try a different search." : "Type to search skills..."}
              </div>
            ) : (
              <div className="p-1">
                {filteredResults.slice(0, 20).map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    className="hover:bg-muted flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors"
                    onClick={() => addSkill(skill)}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground ml-1 text-xs">{skill.repo}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">{skill.installs}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-[11px]">
        Add up to {MAX_SKILLS} skills from{" "}
        <a
          href={SKILLS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          skills.sh
        </a>{" "}
        — the open agent skills directory.
      </p>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => {
            const parts = id.split("/");
            const name = parts[parts.length - 1] ?? id;
            return (
              <Badge key={id} variant="secondary" className="gap-1 pr-1">
                <span className="max-w-32 truncate">{name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-4 hover:bg-transparent"
                  onClick={() => removeSkill(id)}
                  disabled={disabled}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {error && <p className="text-destructive text-[11px]">{error}</p>}
    </div>
  );
}
