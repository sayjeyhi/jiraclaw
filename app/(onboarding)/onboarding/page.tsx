"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
          <Building2 className="size-6" />
        </div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Create your workspace
        </h1>
        <p className="text-muted-foreground text-sm">
          A workspace holds your bots, integrations, and team. You can invite others later.
        </p>
      </div>

      <CreateWorkspaceForm onSuccess={(id) => router.push(`/w/${id}/bots`)} />
    </div>
  );
}
