"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ExternalLink, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillsPicker } from "@/components/bots/skills-picker";
import type { BotConfig } from "@/lib/types";

const SKILLS_URL = "https://skills.sh";

interface BotDetailSkillsProps {
  bot: BotConfig;
  onSkillsSave: (skills: string[]) => Promise<void>;
}

export function BotDetailSkills({ bot, onSkillsSave }: BotDetailSkillsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(bot.skills ?? []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) setSkills(bot.skills ?? []);
  }, [bot.skills, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSkillsSave(skills);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSkills(bot.skills ?? []);
    setIsEditing(false);
  };

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" />
          <h3 className="text-sm font-medium">Skills</h3>
        </div>
        {!isEditing ? (
          <Button variant="ghost" size="xs" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-1 size-3" />
            Edit
          </Button>
        ) : (
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="xs" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-1 size-3" />
              Cancel
            </Button>
            <Button size="xs" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="mr-1 size-3" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <SkillsPicker value={skills} onChange={setSkills} />
      ) : skills.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground text-sm">
            No skills added. Click Edit to add skills.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {skills.map((id) => {
            const parts = id.split("/");
            const name = parts[parts.length - 1] ?? id;
            const repo = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : id;
            const skillUrl = `${SKILLS_URL}/${id}`;
            return (
              <Link
                key={id}
                href={skillUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border bg-muted/20 hover:border-primary/30 group flex items-center gap-3 rounded-lg border p-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-card-foreground text-xs font-medium">{name}</p>
                  <p className="text-muted-foreground truncate text-[9px]">{repo}</p>
                </div>
                <ExternalLink className="text-muted-foreground group-hover:text-primary size-3 shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
