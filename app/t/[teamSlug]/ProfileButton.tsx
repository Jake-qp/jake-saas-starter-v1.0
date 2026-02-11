"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { AuthLoading, Authenticated, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { PersonIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons";

export function ProfileButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { teamSlug } = useParams();
  const user = useQuery(api.users.viewer);

  const handleSignOut = () => {
    void signOut().then(() => router.push("/"));
  };

  return (
    <div className="flex gap-4">
      <AuthLoading>
        <Skeleton className="w-8 h-8 rounded-full" />
      </AuthLoading>
      <Authenticated>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <PersonIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {user?.fullName ?? user?.email ?? "Account"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user?.email && (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() =>
                router.push(`/t/${String(teamSlug)}/settings/profile`)
              }
            >
              <GearIcon className="mr-2 h-4 w-4" />
              Profile settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <ExitIcon className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Authenticated>
    </div>
  );
}
