"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Terminal,
  Send,
  Shield,
  Headphones,
  Hash,
  MessageCircle,
  MessageSquare,
  Feather,
  Bot,
  MessagesSquare,
  Grid3X3,
  Smartphone,
  Mail,
  Bell,
  Camera,
  Webhook,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { ChannelConfig } from "@/lib/types"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal,
  Send,
  Shield,
  Headphones,
  Hash,
  MessageCircle,
  MessageSquare,
  Feather,
  Bot,
  MessagesSquare,
  Grid3x3: Grid3X3,
  Smartphone,
  Mail,
  Bell,
  Camera,
  Webhook,
}

interface ChannelCardProps {
  channel: ChannelConfig
  onToggle: (id: string, enabled: boolean) => void
  onUpdateCredentials: (id: string, credentials: Record<string, string>) => void
}

export function ChannelCard({ channel, onToggle, onUpdateCredentials }: ChannelCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [credentials, setCredentials] = useState(channel.credentials)

  const Icon = iconMap[channel.icon] ?? Terminal
  const credentialKeys = Object.keys(credentials)
  const hasCredentials = credentialKeys.length > 0

  const updateCredential = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-colors",
        channel.enabled ? "border-primary/30" : "border-border"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-md",
              channel.enabled
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-card-foreground">{channel.name}</h3>
            {hasCredentials && channel.enabled && (
              <p className="text-xs text-muted-foreground">
                {credentialKeys.length} credential{credentialKeys.length !== 1 ? "s" : ""} configured
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {channel.enabled && hasCredentials && (
            <Badge variant="outline" className="text-[10px] text-success border-success/25">
              Active
            </Badge>
          )}
          <Switch
            checked={channel.enabled}
            onCheckedChange={(checked) => onToggle(channel.id, checked)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            <span className="sr-only">Toggle details</span>
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Credentials</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="mr-1 size-3" /> : <Eye className="mr-1 size-3" />}
                {showSecrets ? "Hide" : "Show"}
              </Button>
            </div>

            {credentialKeys.length > 0 ? (
              <div className="flex flex-col gap-2">
                {credentialKeys.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <Label className="w-28 shrink-0 text-xs text-muted-foreground">{key}</Label>
                    <Input
                      type={showSecrets ? "text" : "password"}
                      value={credentials[key]}
                      onChange={(e) => updateCredential(key, e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="self-end"
                  onClick={() => onUpdateCredentials(channel.id, credentials)}
                >
                  Save Credentials
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No credentials required for this channel.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
