"use client"

import { Suspense } from "react"
import { LogsContent } from "@/components/logs/logs-content"

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-sm text-muted-foreground">Loading logs...</div>}>
      <LogsContent />
    </Suspense>
  )
}
