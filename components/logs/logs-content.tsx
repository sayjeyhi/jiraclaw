"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { LogFilters } from "@/components/logs/log-filters"
import { LogEntryRow } from "@/components/logs/log-entry"
import { fetcher } from "@/lib/api"
import { LogsSkeleton } from "@/components/loading-skeletons"
import type { LogLevel, LogService, LogEntry } from "@/lib/types"

const ITEMS_PER_PAGE = 30

const serviceTabs: { value: LogService | "all"; label: string }[] = [
  { value: "all", label: "All Services" },
  { value: "jira", label: "Jira" },
  { value: "git", label: "Git" },
  { value: "ai", label: "AI" },
  { value: "channels", label: "Channels" },
]

export function LogsContent() {
  const searchParams = useSearchParams()
  const repoFromUrl = searchParams.get("repo")

  const [activeTab, setActiveTab] = useState<LogService | "all">("all")
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState<LogLevel | "all">("all")
  const [page, setPage] = useState(1)
  const [repoFilter, setRepoFilter] = useState<string | null>(repoFromUrl)

  // Build query params for the API
  const queryParams = useMemo(() => {
    const p: Record<string, string> = { perPage: "200" }
    if (activeTab !== "all") p.service = activeTab
    if (level !== "all") p.level = level
    if (search) p.search = search
    if (repoFilter) p.repo = repoFilter
    return new URLSearchParams(p).toString()
  }, [activeTab, level, search, repoFilter])

  const { data, isLoading } = useSWR<{ data: LogEntry[]; total: number }>(
    `/api/logs?${queryParams}`,
    fetcher
  )

  if (isLoading) return <LogsSkeleton />

  const allLogs = data?.data ?? []
  const paginatedLogs = allLogs.slice(0, page * ITEMS_PER_PAGE)
  const hasMore = paginatedLogs.length < allLogs.length

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify(allLogs, null, 2)],
      { type: "application/json" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `jiraclaw-logs-${activeTab}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Logs"
        description="Monitor activity and debug issues across all services."
      />

      {repoFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs">
            Filtered by repo: <span className="text-primary">{repoFilter}</span>
            <button
              type="button"
              onClick={() => setRepoFilter(null)}
              className="ml-1 rounded-sm hover:bg-accent/50 p-0.5"
              aria-label="Clear repo filter"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as LogService | "all"); setPage(1) }}>
        <TabsList>
          {serviceTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <LogFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            level={level}
            onLevelChange={(v) => { setLevel(v); setPage(1) }}
            onExport={handleExport}
          />
        </div>

        {serviceTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
                <span className="size-3" />
                <span className="w-32 shrink-0">Time</span>
                <span className="w-16 shrink-0 text-center">Level</span>
                <span className="w-16 shrink-0 text-center">Service</span>
                <span className="shrink-0 w-20">Repo</span>
                <span className="shrink-0 w-12">Bot</span>
                <span className="flex-1">Message</span>
              </div>

              {paginatedLogs.length > 0 ? (
                <div>
                  {paginatedLogs.map((entry) => (
                    <LogEntryRow key={entry.id} entry={entry} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  No logs matching the current filters.
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <span className="text-xs text-muted-foreground">
                  Showing {paginatedLogs.length} of {allLogs.length} entries
                </span>
                {hasMore && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="text-xs font-medium text-primary hover:underline"
                    type="button"
                  >
                    Load more
                  </button>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
