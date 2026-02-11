"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthLoading, Authenticated } from "convex/react";

export function ProfileButton() {
  // TODO: F001-001 will add Convex Auth user menu
  return (
    <div className="flex gap-4">
      <AuthLoading>
        <Skeleton className="w-8 h-8 rounded-full" />
      </AuthLoading>
      <Authenticated>
        <Button variant="ghost" size="sm">
          Account
        </Button>
      </Authenticated>
    </div>
  );
}
