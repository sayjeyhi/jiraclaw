"use client";

import { useParams, useRouter } from "next/navigation";
import { LogOut, Shield, Settings, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();

  const { data: membership } = useSWR<{ role: string } | null>(
    workspaceId ? `/api/w/${workspaceId}/membership/${user?.id}` : null,
    fetcher,
  );
  console.log({ membership });
  const isWorkspaceAdmin = membership?.role === "admin" || membership?.role === "owner";

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2"
          aria-label="User menu"
        >
          <Avatar className="border-border size-8 border">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm leading-none font-medium">{user.name}</p>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className="px-1.5 py-0 text-[10px]"
              >
                {user.role}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isWorkspaceAdmin && (
            <DropdownMenuItem onClick={() => router.push(`/w/${workspaceId}/admin`)}>
              <Shield className="mr-2 size-4" />
              Manage Users
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push(`/w/${workspaceId}/profile`)}>
            <Settings className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/w/${workspaceId}/billing`)}>
            <CreditCard className="mr-2 size-4" />
            Billing
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            signOut();
            router.push("/sign-in");
          }}
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
