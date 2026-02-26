"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Bot,
  Kanban,
  BrainCircuit,
  FileText,
  Radio,
  ScrollText,
  Grip,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";

const navigation = [
  { name: "Bots", href: "/bots", icon: Bot },
  { name: "Jira Integration", href: "/jira", icon: Kanban },
  { name: "AI Models", href: "/ai-models", icon: BrainCircuit },
  { name: "Prompts", href: "/prompts", icon: FileText },
  { name: "Channels", href: "/channels", icon: Radio },
  { name: "Logs", href: "/logs", icon: ScrollText },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className="border-sidebar-border flex h-14 items-center gap-2 border-b px-4">
        <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
          <Grip className="text-primary-foreground size-4" />
        </div>
        <span className="text-sidebar-foreground text-base font-semibold tracking-tight">
          JiraClaw
        </span>
      </div>

      <nav className="flex-1 px-3 py-3">
        <ul className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
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
      <div className="border-border bg-sidebar flex h-14 items-center justify-between border-b px-4 md:hidden">
        <div className="flex items-center gap-3">
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
            <div className="bg-primary flex size-7 items-center justify-center rounded-md">
              <Logo />
            </div>
            <span className="text-foreground text-sm font-semibold tracking-tight">JiraClaw</span>
          </div>
        </div>
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
          <aside className="bg-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col md:hidden">
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
