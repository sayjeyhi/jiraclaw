"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User } from "./types"
import { ADMIN_PERMISSIONS, DEFAULT_USER_PERMISSIONS } from "./types"

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah.chen@jiraclaw.ai",
    role: "admin",
    permissions: ADMIN_PERMISSIONS,
    avatarUrl: "https://www.gravatar.com/avatar/6f3b47c0e1e7a5d2f3e2a1b9c8d7e6f5?d=identicon&s=80",
    createdAt: "2025-11-01T08:00:00Z",
  },
  {
    id: "user-2",
    name: "Alex Rivera",
    email: "alex.r@jiraclaw.ai",
    role: "user",
    permissions: {
      ...DEFAULT_USER_PERMISSIONS,
      bots: { view: true, create: true, edit: true, delete: false },
      jira: { view: true, create: true, edit: false, delete: false },
    },
    createdAt: "2026-01-10T14:00:00Z",
  },
  {
    id: "user-3",
    name: "Jordan Kim",
    email: "j.kim@jiraclaw.ai",
    role: "user",
    permissions: DEFAULT_USER_PERMISSIONS,
    createdAt: "2026-02-05T09:30:00Z",
  },
]

interface AuthContextValue {
  user: User | null
  users: User[]
  isLoading: boolean
  signIn: (email: string) => void
  signOut: () => void
  updateUser: (updates: Partial<User>) => void
  updateUsers: (users: User[]) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUsers[0])
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isLoading] = useState(false)

  const signIn = useCallback(
    (email: string) => {
      const found = users.find((u) => u.email === email)
      if (found) {
        setUser(found)
      }
    },
    [users]
  )

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!user) return
      const updated = { ...user, ...updates }
      setUser(updated)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    },
    [user]
  )

  const updateUsers = useCallback((newUsers: User[]) => {
    setUsers(newUsers)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, users, isLoading, signIn, signOut, updateUser, updateUsers }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
