import { AppSidebar, MobileHeader } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { AuthGuard } from "@/components/auth-guard";

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
            <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
