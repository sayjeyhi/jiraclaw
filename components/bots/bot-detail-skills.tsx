"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ExternalLink, Pencil, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary size-4" />
        <h3 className="text-sm font-medium">Skills</h3>
        <a
          href={SKILLS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1 text-xs"
        >
          From skills.sh
          <ExternalLink className="size-3" />
        </a>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-1 size-3.5" />
            Edit
          </Button>
        ) : (
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-1 size-3.5" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="mr-1 size-3.5" />
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
        <p className="text-muted-foreground text-sm">
          No skills added. Click Edit to add skills from{" "}
          <a
            href={SKILLS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            skills.sh
          </a>
          .
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((id) => {
            const parts = id.split("/");
            const name = parts[parts.length - 1] ?? id;
            const repo = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : id;
            const skillUrl = `${SKILLS_URL}/${id}`;
            return (
              <Badge key={id} variant="secondary" className="font-normal" asChild>
                <Link
                  href={skillUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-secondary/80 flex items-center gap-1 transition-colors"
                >
                  <span>{name}</span>
                  <span className="text-muted-foreground text-[10px]">{repo}</span>
                  <ExternalLink className="size-3 opacity-60" />
                </Link>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
