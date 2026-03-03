"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { BrainCircuit, Kanban, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { name: "AI Providers", path: "ai-providers", icon: BrainCircuit },
  { name: "Ticket Integration", path: "ticket-integration", icon: Kanban },
  { name: "System Prompts", path: "system-prompts", icon: FileText },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const base = `/w/${workspaceId}/settings`;

  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="space-y-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage AI providers, integrations, and system prompts.
          </p>
        </div>
        <nav className="border-border -mb-px flex gap-0 border-b" aria-label="Settings sections">
          {settingsTabs.map((tab) => {
            const href = `${base}/${tab.path}`;
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={tab.path}
                href={href}
                className={cn(
                  "hover:text-foreground flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:border-muted-foreground/30 border-transparent",
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
