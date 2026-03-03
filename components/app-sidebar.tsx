"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { useTheme } from "next-themes";
import { fetcher } from "@/lib/api";
import type { BotConfig } from "@/lib/types";
import {
  Bot,
  Kanban,
  BrainCircuit,
  FileText,
  Radio,
  ScrollText,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

const mainNavItems = [
  { name: "Channels", path: "channels", icon: Radio },
  { name: "Logs", path: "logs", icon: ScrollText },
  { name: "Settings", path: "settings", icon: Settings },
];

function getWorkspaceBase(pathname: string): string | null {
  const match = pathname.match(/^(\/w\/[^/]+)/);
  return match ? match[1] : null;
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const base = getWorkspaceBase(pathname);
  const workspaceId = base?.replace("/w/", "") ?? "ws-default";
  const { data: bots = [] } = useSWR<BotConfig[]>(
    base ? `/api/w/${workspaceId}/bots` : null,
    fetcher,
  );
  const hasBots = bots.length > 0;

  return (
    <>
      <div className="border-sidebar-border flex h-14 items-center gap-2 border-b px-4">
        <Logo className="size-6" />
        <span className="text-sidebar-foreground text-base font-semibold tracking-tight">
          JiraClaw
        </span>
      </div>

      <nav className="flex-1 px-3 py-3">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href={base ? `${base}/bots` : "/"}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === (base ? `${base}/bots` : "/")
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              Bots
            </Link>
          </li>

          {hasBots ? (
            bots.map((bot) => {
              const href = base ? `${base}/bots/${bot.id}` : "/";
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={bot.id}>
                  <Link
                    href={href}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center gap-3 truncate rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Bot className="size-4 shrink-0" />
                    <span className="truncate">{bot.title}</span>
                  </Link>
                </li>
              );
            })
          ) : (
            <li>
              <Link
                href={base ? `${base}/bots/new` : "/"}
                onClick={onNavClick}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-sidebar-accent hover:border-primary/30 flex items-center justify-center gap-3 rounded-md border border-dashed px-3 py-2 text-xs font-medium transition-colors"
              >
                <Plus className="size-4 shrink-0" />
                Create a bot
              </Link>
            </li>
          )}

          <li className="mt-10">
            <ul className="flex flex-col gap-1">
              {mainNavItems.map((item) => {
                const href = base ? `${base}/${item.path}` : "/";
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={item.name}>
                    <Link
                      href={href}
                      onClick={onNavClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>

      <div className="border-sidebar-border flex items-center justify-between border-t px-4 py-3">
        <p className="text-muted-foreground text-xs">v1.0.0</p>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative size-7"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-3.5 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-3.5 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
        </Button>
      </div>
    </>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="border-border bg-sidebar flex h-14 items-center justify-between gap-2 border-b px-4 md:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-8"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Logo className="size-6" />
            <span className="text-foreground text-sm font-semibold tracking-tight">JiraClaw</span>
          </div>
        </div>

        <WorkspaceSwitcher />
        <UserMenu />
      </div>

      {/* Overlay */}
      {open && (
        <>
          <div
            className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="bg-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r md:hidden">
            <div className="absolute top-3.5 right-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-8"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </Button>
            </div>
            <SidebarContent onNavClick={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar hidden h-screen w-60 shrink-0 flex-col border-r md:flex">
      <SidebarContent />
    </aside>
  );
}
