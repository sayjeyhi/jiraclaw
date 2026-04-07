import { AppSidebar, MobileHeader } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { AuthGuard } from "@/components/auth-guard";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileHeader />

          {/* Desktop top bar with workspace switcher and user menu */}
          <div className="border-border bg-background hidden h-14 shrink-0 items-center justify-between border-b px-6 md:flex">
            <WorkspaceSwitcher />
            <UserMenu />
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="relative mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</div>

            <footer className="shrink-0 items-center justify-between px-6 pb-4 text-center opacity-70 md:flex">
              <p className="text-muted-foreground text-[10px]">
                All rights reserved © 2026 JiraClaw.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  Terms of Service
                </Link>
                <span className="text-muted-foreground text-[10px]">|</span>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  Privacy Policy
                </Link>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
