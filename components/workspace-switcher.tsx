"use client";

import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import type { Workspace } from "@/lib/workspace-context";
import { cn } from "@/lib/utils";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";

function getWorkspaceIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/w\/([^/]+)/);
  return match ? match[1] : null;
}

const WORKSPACE_LIMIT = parseInt(process.env.WORKSPACE_LIMIT + "", 10);

export function WorkspaceSwitcher() {
  const pathname = usePathname();
  const workspaceId = getWorkspaceIdFromPath(pathname);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    api.workspaces.list().then(setWorkspaces);
  }, []);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const ws = workspaces.find((w) => w.id === workspaceId);
      setCurrentWorkspace(ws ?? null);
    } else {
      setCurrentWorkspace(null);
    }
  }, [workspaceId, workspaces]);

  if (!workspaceId) return null;

  const switchTo = (id: string) => {
    const segments = pathname.split("/");
    const wIndex = segments.indexOf("w");
    if (wIndex >= 0 && segments[wIndex + 1]) {
      segments[wIndex + 1] = id;
      window.location.href = segments.join("/");
    } else {
      window.location.href = `/w/${id}/bots`;
    }
  };

  const atLimit = workspaces.length >= WORKSPACE_LIMIT;

  return (
    <div className="flex items-center gap-2 text-xs">
      Workspace:{" "}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            role="combobox"
            className="min-w-40 justify-between gap-2"
          >
            <span className="truncate">{currentWorkspace?.name ?? "Select workspace"}</span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => switchTo(ws.id)}
              className={ws.id === workspaceId ? "bg-accent" : ""}
            >
              {ws.name}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => !atLimit && setDialogOpen(true)}
            className={cn(
              "gap-2",
              atLimit ? "text-muted-foreground cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
            disabled={atLimit}
          >
            <Plus className="size-3.5" />
            <span>New workspace</span>
            {atLimit && (
              <span className="text-muted-foreground ml-auto text-[10px]">
                {WORKSPACE_LIMIT}/{WORKSPACE_LIMIT}
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="bg-primary/10 text-primary mb-1 flex size-10 items-center justify-center rounded-full">
              <Building2 className="size-5" />
            </div>
            <DialogTitle>Create a new workspace</DialogTitle>
            <DialogDescription>
              A workspace holds your bots, integrations, and team. You can invite others later.
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm
            onSuccess={(id) => {
              setDialogOpen(false);
              switchTo(id);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
