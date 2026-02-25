"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Shield,
  User,
  Calendar,
  Save,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { formatFullDate } from "@/lib/utils"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [name, setName] = useState(user?.name ?? "")
  const [saved, setSaved] = useState(false)

  if (!user) {
    router.push("/sign-in")
    return null
  }

  function handleSave() {
    updateUser({ name })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar and summary */}
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6">
          <Avatar className="size-20 border-2 border-border">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-base font-semibold text-foreground">
              {user.name}
            </h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className="mt-1 gap-1 text-[10px]"
            >
              <Shield className="size-2.5" />
              {user.role === "admin" ? "Administrator" : "User"}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="size-3" />
            Joined {formatFullDate(user.createdAt)}
          </div>
          {user.role === "admin" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full gap-2 text-xs"
              onClick={() => router.push("/admin")}
            >
              <Shield className="size-3" />
              Manage Users
            </Button>
          )}
        </div>

        {/* Edit form */}
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 md:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Account Details
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage your profile information
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-xs">
                <User className="size-3" />
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-3" />
                Email
              </Label>
              <Input
                value={user.email}
                disabled
                className="h-9 text-sm opacity-60"
              />
              <p className="text-[10px] text-muted-foreground">
                Email is managed by your OAuth provider and cannot be changed
                here.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="size-3" />
                Role
              </Label>
              <Input
                value={user.role === "admin" ? "Administrator" : "User"}
                disabled
                className="h-9 text-sm opacity-60"
              />
              <p className="text-[10px] text-muted-foreground">
                Roles are assigned by administrators.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            {saved && (
              <span className="text-xs text-success">Changes saved</span>
            )}
            <Button size="sm" className="gap-2 text-xs" onClick={handleSave}>
              <Save className="size-3" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
