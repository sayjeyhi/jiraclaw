"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Mail, Shield, User, Calendar, Save, Sun, Moon, Monitor } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth-context";
import { formatFullDate } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  function handleSave() {
    updateUser({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/5 text-primary flex size-8 items-center justify-center rounded">
          <User className="text-primary size-5" />
        </div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar and summary */}
        <div className="border-border bg-card flex flex-col items-center gap-4 rounded-lg border p-6">
          <Avatar className="border-border size-20 border-2">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-foreground text-base font-semibold">{user.name}</h2>
            <p className="text-muted-foreground text-xs">{user.email}</p>
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className="mt-1 gap-1 text-[10px]"
            >
              <Shield className="size-2.5" />
              {user.role === "admin" ? "Administrator" : "User"}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-[10px]">
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
        <div className="border-border bg-card flex flex-col gap-6 rounded-lg border p-6 md:col-span-2">
          <div>
            <h3 className="text-foreground text-sm font-semibold">Account Details</h3>
            <p className="text-muted-foreground mt-1 text-xs">Manage your profile information</p>
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
              <Label className="text-muted-foreground flex items-center gap-2 text-xs">
                <Mail className="size-3" />
                Email
              </Label>
              <Input value={user.email} disabled className="h-9 text-sm opacity-60" />
              <p className="text-muted-foreground text-[10px]">
                Email is managed by your OAuth provider and cannot be changed here.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground flex items-center gap-2 text-xs">
                <Shield className="size-3" />
                Role
              </Label>
              <Input
                value={user.role === "admin" ? "Administrator" : "User"}
                disabled
                className="h-9 text-sm opacity-60"
              />
              <p className="text-muted-foreground text-[10px]">
                Roles are assigned by administrators.
              </p>
            </div>
          </div>

          <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
            {saved && <span className="text-success text-xs">Changes saved</span>}
            <Button size="sm" className="gap-2 text-xs" onClick={handleSave}>
              <Save className="size-3" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Appearance / Color preference */}
        <div className="border-border bg-card flex flex-col gap-6 rounded-lg border p-6 md:col-span-3">
          <div>
            <h3 className="text-foreground text-sm font-semibold">Appearance</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Choose how JiraClaw looks. System follows your device settings.
            </p>
          </div>

          {mounted && (
            <RadioGroup
              value={theme ?? "system"}
              onValueChange={(value) => setTheme(value)}
              className="flex flex-wrap gap-4"
            >
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className="border-border hover:border-primary/50 has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
                >
                  <RadioGroupItem value={value} id={`theme-${value}`} />
                  <Icon className="text-muted-foreground size-4 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                  {value === "system" && resolvedTheme && (
                    <span className="text-muted-foreground text-xs">({resolvedTheme})</span>
                  )}
                </label>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>
    </div>
  );
}
