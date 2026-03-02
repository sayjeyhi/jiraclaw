"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ArrowLeft,
  Users,
  Search,
  MoreVertical,
  Trash2,
  UserPlus,
  Lock,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { fetcher, api } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ListSkeleton } from "@/components/loading-skeletons";
import type { User, UserRole, UserPermissions } from "@/lib/types";
import { ADMIN_PERMISSIONS, DEFAULT_USER_PERMISSIONS } from "@/lib/types";
import { cn, formatFullDate } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---- Service permission config ----
const SERVICE_SECTIONS: {
  key: keyof UserPermissions;
  label: string;
  actions: { key: string; label: string }[];
}[] = [
  {
    key: "bots",
    label: "Bots",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add Bot" },
      { key: "edit", label: "Edit Bot" },
      { key: "delete", label: "Delete Bot" },
    ],
  },
  {
    key: "ticket",
    label: "Ticket Integration",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add Integration" },
      { key: "edit", label: "Edit Integration" },
      { key: "delete", label: "Delete Integration" },
    ],
  },
  {
    key: "ai_providers",
    label: "AI Providers",
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Edit / Toggle" },
    ],
  },
  {
    key: "prompts",
    label: "Prompts",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add Prompt" },
      { key: "edit", label: "Edit Prompt" },
      { key: "delete", label: "Delete Prompt" },
    ],
  },
  {
    key: "channels",
    label: "Channels",
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Edit / Toggle" },
    ],
  },
  {
    key: "logs",
    label: "Logs",
    actions: [{ key: "view", label: "View" }],
  },
];

// ---- Permission Editor Grid ----
function PermissionEditor({
  permissions,
  onChange,
  disabled,
}: {
  permissions: UserPermissions;
  onChange: (p: UserPermissions) => void;
  disabled?: boolean;
}) {
  function toggle(service: keyof UserPermissions, action: string, current: boolean) {
    if (disabled) return;
    const updated = { ...permissions };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = { ...(updated[service] as any) };
    svc[action] = !current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated as any)[service] = svc;
    onChange(updated);
  }

  function toggleAllService(service: keyof UserPermissions, allOn: boolean) {
    if (disabled) return;
    const updated = { ...permissions };
    const section = SERVICE_SECTIONS.find((s) => s.key === service);
    if (!section) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc: any = {};
    for (const a of section.actions) {
      svc[a.key] = !allOn;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated as any)[service] = svc;
    onChange(updated);
  }

  return (
    <div className="flex flex-col gap-1">
      {SERVICE_SECTIONS.map((section) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const svc = permissions[section.key] as any;
        const allOn = section.actions.every((a) => svc[a.key] === true);
        return (
          <div
            key={section.key}
            className="border-border bg-muted/30 flex items-center gap-4 rounded-md border px-3 py-2"
          >
            <div className="flex w-32 shrink-0 items-center gap-2">
              <Checkbox
                checked={allOn}
                onCheckedChange={() => toggleAllService(section.key, allOn)}
                disabled={disabled}
                className="size-3.5"
              />
              <span className="text-foreground text-[11px] font-medium">{section.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {section.actions.map((action) => {
                const on = svc[action.key] === true;
                return (
                  <label
                    key={action.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[10px] transition-colors",
                      on ? "bg-primary/10 text-primary" : "text-muted-foreground bg-transparent",
                      disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <Checkbox
                      checked={on}
                      onCheckedChange={() => toggle(section.key, action.key, on)}
                      disabled={disabled}
                      className="size-3"
                    />
                    {action.label}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Add User Dialog ----
function AddUserDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (u: Omit<User, "id" | "createdAt">) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_USER_PERMISSIONS);
  const [saving, setSaving] = useState(false);

  function handleRoleChange(r: UserRole) {
    setRole(r);
    setPermissions(r === "admin" ? ADMIN_PERMISSIONS : DEFAULT_USER_PERMISSIONS);
  }

  async function handleSave() {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      await onSave({ name, email, role, permissions });
      setName("");
      setEmail("");
      setRole("user");
      setPermissions(DEFAULT_USER_PERMISSIONS);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="text-primary size-4" />
            Add User
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="h-9 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-9 text-xs"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Role</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === "user" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleRoleChange("user")}
              >
                User
              </Button>
              <Button
                type="button"
                variant={role === "admin" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleRoleChange("admin")}
              >
                Admin
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Access Permissions</Label>
            <p className="text-muted-foreground text-[10px]">
              {role === "admin"
                ? "Admins have full access to all services."
                : "Toggle which actions this user can perform per service."}
            </p>
            <PermissionEditor
              permissions={permissions}
              onChange={setPermissions}
              disabled={role === "admin"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || saving}
            className="text-xs"
          >
            {saving && <Loader2 className="mr-1.5 size-3 animate-spin" />}
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Edit Permissions Dialog ----
function EditPermissionsDialog({
  target,
  open,
  onOpenChange,
  onSave,
}: {
  target: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, permissions: UserPermissions, role: UserRole) => Promise<void>;
}) {
  const [permissions, setPermissions] = useState<UserPermissions>(
    target?.permissions ?? DEFAULT_USER_PERMISSIONS,
  );
  const [role, setRole] = useState<UserRole>(target?.role ?? "user");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (target) {
      setPermissions(target.permissions ?? DEFAULT_USER_PERMISSIONS);
      setRole(target.role ?? "user");
    }
  }, [target]);

  function handleRoleChange(r: UserRole) {
    setRole(r);
    if (r === "admin") setPermissions(ADMIN_PERMISSIONS);
  }

  async function handleSave() {
    if (!target) return;
    setSaving(true);
    try {
      await onSave(target.id, permissions, role);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setPermissions(DEFAULT_USER_PERMISSIONS);
          setRole("user");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lock className="text-primary size-4" />
            {"Edit Access \u2014 "}
            {target?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Role</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === "user" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleRoleChange("user")}
              >
                User
              </Button>
              <Button
                type="button"
                variant={role === "admin" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleRoleChange("admin")}
              >
                Admin
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Access Permissions</Label>
            <p className="text-muted-foreground text-[10px]">
              {role === "admin"
                ? "Admins have full access to all services."
                : "Toggle which actions this user can perform per service."}
            </p>
            <PermissionEditor
              permissions={permissions}
              onChange={setPermissions}
              disabled={role === "admin"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs" disabled={saving}>
            {saving && <Loader2 className="mr-1.5 size-3 animate-spin" />}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Manage Users Page ----
export default function ManageUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userSearch, setUserSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const {
    data: users,
    isLoading,
    mutate: mutateUsers,
  } = useSWR<User[]>("/api/admin/users", fetcher);

  if (!user || user.role !== "admin") {
    router.push("/bots");
    return null;
  }

  const allUsers = users ?? [];
  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  async function handleAddUser(data: Omit<User, "id" | "createdAt">) {
    await api.auth.createUser({
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
    } as unknown as Record<string, unknown>);
    mutateUsers();
  }

  async function handleSavePermissions(
    id: string,
    newPermissions: UserPermissions,
    newRole: UserRole,
  ) {
    await api.auth.updateUser(id, {
      permissions: newPermissions,
      role: newRole,
    } as unknown as Record<string, unknown>);
    mutateUsers();
  }

  function countPermissions(u: User) {
    const perms = u.permissions ?? DEFAULT_USER_PERMISSIONS;
    let total = 0;
    let enabled = 0;
    for (const section of SERVICE_SECTIONS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svc = (perms[section.key] ?? {}) as any;
      for (const a of section.actions) {
        total++;
        if (svc[a.key]) enabled++;
      }
    }
    return { total, enabled };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="text-primary size-5" />
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Manage Users</h1>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-foreground text-sm font-semibold">Team Members</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">{allUsers.length} users registered</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="size-3.5" />
            Add User
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : (
        <div className="border-border rounded-lg border">
          <div className="border-border bg-muted/50 text-muted-foreground grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-2 text-[10px] font-medium tracking-wider uppercase">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Access</span>
            <span>Joined</span>
            <span className="sr-only">Actions</span>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="text-muted-foreground px-4 py-8 text-center text-xs">
              No users found
            </div>
          ) : (
            filteredUsers.map((u) => {
              const { total, enabled } = countPermissions(u);
              return (
                <div
                  key={u.id}
                  className="border-border grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="border-border size-7 border">
                      <AvatarImage src={u.avatarUrl} alt={u.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground text-xs font-medium">{u.name}</span>
                    {u.id === user.id && (
                      <Badge variant="outline" className="px-1 py-0 text-[9px]">
                        You
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">{u.email}</span>
                  <Badge
                    variant={u.role === "admin" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {u.role === "admin" ? "Admin" : "User"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-7 gap-1.5 text-[10px]",
                      enabled === total
                        ? "border-emerald-500/25 text-emerald-500"
                        : enabled > 0
                          ? "border-amber-500/25 text-amber-500"
                          : "border-destructive/25 text-destructive",
                    )}
                    onClick={() => {
                      setEditTarget(u);
                      setEditDialogOpen(true);
                    }}
                    disabled={u.id === user.id}
                  >
                    <Lock className="size-3" />
                    {enabled}/{total}
                  </Button>
                  <span className="text-muted-foreground text-[10px]">
                    {formatFullDate(u.createdAt)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={u.id === user.id}
                      >
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditTarget(u);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Lock className="mr-2 size-3.5" />
                        Edit Access
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(u)}>
                        <Trash2 className="mr-2 size-3.5" />
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      )}

      <AddUserDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSave={handleAddUser} />
      <EditPermissionsDialog
        target={editTarget}
        open={editDialogOpen}
        onOpenChange={(o) => {
          setEditDialogOpen(o);
          if (!o) setEditTarget(null);
        }}
        onSave={handleSavePermissions}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove User"
        description={`Are you sure you want to remove "${deleteTarget?.name}" (${deleteTarget?.email})? This will revoke their access to JiraClaw. This action cannot be undone.`}
        confirmLabel="Remove User"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await api.auth.deleteUser(deleteTarget.id);
          mutateUsers();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
