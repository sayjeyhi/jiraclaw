"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useTheme } from "next-themes"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"

const navigation = [
  { name: "Bots", href: "/bots", icon: Bot },
  { name: "Jira Integration", href: "/jira", icon: Kanban },
  { name: "AI Models", href: "/ai-models", icon: BrainCircuit },
  { name: "Prompts", href: "/prompts", icon: FileText },
  { name: "Channels", href: "/channels", icon: Radio },
  { name: "Logs", href: "/logs", icon: ScrollText },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <Grip className="size-4 text-primary-foreground" />
        </div>
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          JiraClaw
        </span>
      </div>

      <nav className="flex-1 px-3 py-3">
        <ul className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex items-center justify-between border-t border-sidebar-border px-4 py-3">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-7 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </>
  )
}

export function MobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary">
              <Grip className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              JiraClaw
            </span>
          </div>
        </div>
        <UserMenu />
      </div>

      {/* Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar md:hidden">
            <div className="absolute right-3 top-3.5 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
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
  )
}

export function AppSidebar() {
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <SidebarContent />
    </aside>
  )
}
