"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { LogsContent } from "@/components/logs/logs-content";

function LogsPageContent() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return <LogsContent workspaceId={workspaceId} />;
}

export default function LogsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex items-center justify-center py-24 text-sm">
          Loading logs...
        </div>
      }
    >
      <LogsPageContent />
    </Suspense>
  );
}
