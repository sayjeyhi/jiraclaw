"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface WorkspaceContextValue {
  workspaceId: string | null;
  workspaces: Workspace[];
  setWorkspaceId: (id: string) => void;
  switchWorkspace: (id: string) => void;
  isLoading: boolean;
  mutateWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  workspaceId,
  workspaces,
}: {
  children: ReactNode;
  workspaceId: string;
  workspaces: Workspace[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [localWorkspaces, setLocalWorkspaces] = useState(workspaces);

  const switchWorkspace = useCallback(
    (newWorkspaceId: string) => {
      // Replace workspace segment in path: /w/ws-default/bots -> /w/ws-new/bots
      const segments = pathname.split("/");
      const wIndex = segments.indexOf("w");
      if (wIndex >= 0 && segments[wIndex + 1]) {
        segments[wIndex + 1] = newWorkspaceId;
        router.push(segments.join("/"));
      } else {
        router.push(`/w/${newWorkspaceId}/bots`);
      }
    },
    [pathname, router],
  );

  const mutateWorkspaces = useCallback(async () => {
    const res = await fetch("/api/workspaces");
    const data = await res.json();
    setLocalWorkspaces(data);
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      workspaces: localWorkspaces,
      setWorkspaceId: () => {},
      switchWorkspace,
      isLoading: false,
      mutateWorkspaces,
    }),
    [workspaceId, localWorkspaces, switchWorkspace, mutateWorkspaces],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
