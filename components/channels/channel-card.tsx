"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FlaskConical,
  Loader2,
  TerminalIcon,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { iconMap } from "./channel-icons";
import type { ChannelConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Slugs that require an explicit recipient at send time */
const RECIPIENT_REQUIRED_SLUGS = new Set(["email", "whatsapp"]);

type TestState =
  | { status: "idle" }
  | { status: "awaiting-recipient" }
  | { status: "testing" }
  | { status: "success"; externalId?: string }
  | { status: "error"; error: string };

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "success" }
  | { status: "error"; error: string };

/** Parse allowedUsernames from credentials - supports JSON array or comma-separated */
function parseAllowedUsernames(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed) as unknown[];
      return Array.isArray(arr)
        ? arr.map((u) => String(u).trim().toLowerCase().replace(/^@/, "")).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }
  return trimmed
    .split(",")
    .map((u) => u.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

interface ChannelCardProps {
  channel: ChannelConfig;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdateCredentials: (id: string, credentials: Record<string, string>) => void;
  onTest: (id: string, recipient?: string) => Promise<{ success: boolean; error?: string }>;
}

export function ChannelCard({ channel, onToggle, onUpdateCredentials, onTest }: ChannelCardProps) {
  const [showSecrets, setShowSecrets] = useState(false);
  const [credentials, setCredentials] = useState(channel.credentials);
  const [testState, setTestState] = useState<TestState>({ status: "idle" });
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [testRecipient, setTestRecipient] = useState("");

  const Icon = iconMap[channel.icon] ?? TerminalIcon;
  // For Telegram, only show allowedUsernames (userIdMap is internal)
  const credentialKeys =
    channel.slug === "telegram" ? ["allowedUsernames"] : Object.keys(credentials);
  const hasCredentials = credentialKeys.length > 0;
  const needsRecipient = RECIPIENT_REQUIRED_SLUGS.has(channel.slug);

  const updateCredential = useCallback((key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveCredentials = async () => {
    setSaveState({ status: "saving" });
    try {
      await onUpdateCredentials(channel.id, credentials);
      setSaveState({ status: "success" });
      toast.success("Credentials saved");
      setTimeout(() => setSaveState({ status: "idle" }), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save credentials";
      setSaveState({ status: "error", error: msg });
      toast.error(msg);
      setTimeout(() => setSaveState({ status: "idle" }), 3000);
    }
  };

  const handleTestClick = () => {
    if (needsRecipient) {
      setTestState({ status: "awaiting-recipient" });
    } else {
      runTest();
    }
  };

  const runTest = async (recipient?: string) => {
    setTestState({ status: "testing" });
    try {
      const result = await onTest(channel.id, recipient);
      if (result.success) {
        setTestState({
          status: "success",
          externalId: (result as { externalId?: string }).externalId,
        });
      } else {
        setTestState({ status: "error", error: result.error ?? "Unknown error" });
      }
    } catch (err) {
      setTestState({
        status: "error",
        error: err instanceof Error ? err.message : "Request failed",
      });
    }
    // Auto-clear result after 6 seconds
    setTimeout(() => setTestState({ status: "idle" }), 6000);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runTest(testRecipient.trim() || undefined);
  };

  const isTesting = testState.status === "testing";

  return (
    <div
      className={cn(
        "bg-card rounded-lg border transition-colors",
        channel.enabled ? "border-primary/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-md",
              channel.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <h3 className="text-card-foreground text-sm font-medium">{channel.name}</h3>
            {hasCredentials && channel.enabled && (
              <p className="text-muted-foreground text-xs">
                {credentialKeys.length} credential{credentialKeys.length !== 1 ? "s" : ""}{" "}
                configured
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {channel.enabled && hasCredentials && (
            <Badge variant="outline" className="text-success border-success/25 text-[10px]">
              Active
            </Badge>
          )}
          <Switch
            checked={channel.enabled}
            onCheckedChange={(checked) => onToggle(channel.id, checked)}
          />
        </div>
      </div>

      <div className="border-border border-t px-4 py-3">
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
              {credentialKeys.map((key) => {
                const isSecret = channel.slug !== "telegram" && key !== "allowedUsernames";
                const isTelegramUsernames =
                  channel.slug === "telegram" && key === "allowedUsernames";

                if (isTelegramUsernames) {
                  const usernames = parseAllowedUsernames(credentials[key]);
                  const addUsername = (u: string) => {
                    const normalized = u.trim().toLowerCase().replace(/^@/, "");
                    if (!normalized) return;
                    if (usernames.includes(normalized)) return;
                    const next = [...usernames, normalized];
                    updateCredential(key, JSON.stringify(next));
                  };
                  const removeUsername = (u: string) => {
                    const next = usernames.filter((x) => x !== u);
                    updateCredential(key, next.length ? JSON.stringify(next) : "[]");
                  };

                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <Label className="text-muted-foreground text-xs">Allowed usernames</Label>
                      <AllowedUsernamesInput
                        usernames={usernames}
                        onAdd={addUsername}
                        onRemove={removeUsername}
                      />
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex items-center gap-2">
                    <Label className="text-muted-foreground w-28 shrink-0 text-xs">{key}</Label>
                    <Input
                      type={isSecret && !showSecrets ? "password" : "text"}
                      value={credentials[key] ?? ""}
                      onChange={(e) => updateCredential(key, e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                );
              })}
              <div className="flex items-center justify-between gap-2">
                {saveState.status === "success" && (
                  <span className="text-muted-foreground text-xs">Saved</span>
                )}
                {saveState.status === "error" && (
                  <span className="text-destructive text-xs">{saveState.error}</span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto shrink-0"
                  disabled={saveState.status === "saving"}
                  onClick={handleSaveCredentials}
                >
                  {saveState.status === "saving" ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : null}
                  {saveState.status === "saving" ? "Saving..." : "Save Credentials"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              No credentials required for this channel.
            </p>
          )}
        </div>
      </div>

      {/* Test section */}
      <div className="border-border border-t px-4 py-3">
        {testState.status === "awaiting-recipient" ? (
          <form onSubmit={handleTestSubmit} className="flex items-center gap-2">
            <Input
              autoFocus
              type={channel.slug === "email" ? "email" : "tel"}
              placeholder={channel.slug === "email" ? "you@example.com" : "+1234567890"}
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 shrink-0"
              disabled={!testRecipient.trim()}
            >
              Send Test
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 text-xs"
              onClick={() => setTestState({ status: "idle" })}
            >
              Cancel
            </Button>
          </form>
        ) : testState.status === "success" ? (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>
              Test message delivered
              {testState.externalId ? ` (id: ${testState.externalId})` : ""}
            </span>
          </div>
        ) : testState.status === "error" ? (
          <div className="flex items-start gap-2 text-xs text-red-500">
            <XCircle className="mt-0.5 size-3.5 shrink-0" />
            <span className="break-all">{testState.error}</span>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-7 gap-1.5 px-2 text-xs"
            disabled={!channel.enabled || isTesting}
            onClick={handleTestClick}
          >
            {isTesting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FlaskConical className="size-3.5" />
            )}
            {isTesting ? "Sending..." : "Send test message"}
          </Button>
        )}
      </div>
    </div>
  );
}

function AllowedUsernamesInput({
  usernames,
  onAdd,
  onRemove,
}: {
  usernames: string[];
  onAdd: (u: string) => void;
  onRemove: (u: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed) {
        onAdd(trimmed);
        setInputValue("");
      }
    }
  };

  return (
    <div className="border-border bg-background flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border px-3 py-1.5">
      {usernames.map((u) => (
        <Badge key={u} variant="secondary" className="gap-0.5 pr-1 text-xs font-normal">
          @{u}
          <button
            type="button"
            className="hover:bg-muted-foreground/20 -mr-0.5 rounded p-0.5"
            onClick={() => onRemove(u)}
            aria-label={`Remove ${u}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Input
        type="text"
        placeholder="Add username, press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-w-40 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
