"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { BotCard } from "@/components/bots/bot-card"
import { BotDialog } from "@/components/bots/bot-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageSkeleton } from "@/components/loading-skeletons"
import { fetcher, api } from "@/lib/api"
import type { BotConfig, BotTicket, AIProvider } from "@/lib/types"

export default function BotsPage() {
  const { data: bots, isLoading, mutate: mutateBots } = useSWR<BotConfig[]>("/api/bots", fetcher)
  const { data: providers = [] } = useSWR<AIProvider[]>("/api/ai-models", fetcher)
  const { data: allTickets = [] } = useSWR<BotTicket[]>(
    bots && bots.length > 0 ? bots.map((b) => `/api/bots/${b.id}/tickets`) : null,
    async () => {
      if (!bots) return []
      const results = await Promise.all(bots.map((b) => api.bots.tickets(b.id) as Promise<BotTicket[]>))
      return results.flat()
    }
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BotConfig | null>(null)

  const handleCreate = async (data: Omit<BotConfig, "id" | "createdAt" | "status">) => {
    await api.bots.create(data as unknown as Record<string, unknown>)
    mutateBots()
  }

  const handleEdit = async (data: Omit<BotConfig, "id" | "createdAt" | "status">) => {
    if (!editingBot) return
    await api.bots.update(editingBot.id, data as unknown as Record<string, unknown>)
    mutateBots()
    setEditingBot(null)
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bots"
        description="Create and manage AI-powered bots that monitor Jira and interact with repositories."
      >
        <Button
          onClick={() => {
            setEditingBot(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="mr-2 size-4" />
          Create Bot
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        {(bots ?? []).map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            tickets={allTickets.filter((t) => t.botId === bot.id)}
            onEdit={(b) => {
              setEditingBot(b)
              setDialogOpen(true)
            }}
            onDelete={(id) => {
              const target = (bots ?? []).find((b) => b.id === id)
              if (target) setDeleteTarget(target)
            }}
          />
        ))}
      </div>

      <BotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bot={editingBot}
        providers={providers}
        onSave={editingBot ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Bot"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone. All associated tickets and logs will be preserved.`}
        confirmLabel="Delete Bot"
        onConfirm={async () => {
          if (!deleteTarget) return
          await api.bots.delete(deleteTarget.id)
          mutateBots()
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
