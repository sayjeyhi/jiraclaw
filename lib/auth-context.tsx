"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "./auth-client";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  users: User[];
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateUsers: (users: User[]) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSessionUserToUser(
  sessionUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
    permissions?: unknown;
    avatarUrl?: string | null;
  } | null,
): User | null {
  if (!sessionUser) return null;
  const perms =
    typeof sessionUser.permissions === "string"
      ? (JSON.parse(sessionUser.permissions || "{}") as User["permissions"])
      : ((sessionUser.permissions as User["permissions"]) ?? {});
  return {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    role: (sessionUser.role as User["role"]) ?? "user",
    permissions: perms,
    avatarUrl: sessionUser.avatarUrl ?? sessionUser.image ?? undefined,
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: isLoading } = authClient.useSession();
  const user = mapSessionUserToUser(session?.user ?? null);

  const signOut = async () => {
    await authClient.signOut();
  };

  const updateUser = () => {
    // Session is read-only from better-auth; profile updates would go through API
  };

  const updateUsers = () => {
    // Admin user list is fetched separately
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users: user ? [user] : [],
        isLoading,
        signOut,
        updateUser,
        updateUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
