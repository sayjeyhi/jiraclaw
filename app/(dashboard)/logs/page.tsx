"use client";

import { Suspense } from "react";
import { LogsContent } from "@/components/logs/logs-content";

export default function LogsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex items-center justify-center py-24 text-sm">
          Loading logs...
        </div>
      }
    >
      <LogsContent />
    </Suspense>
  );
}
