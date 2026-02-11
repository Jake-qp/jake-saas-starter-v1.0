"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardButtons() {
  // TODO: F001-001 will add Convex Auth sign-in/sign-up buttons
  return (
    <div className="flex gap-4 animate-[fade-in_0.2s]">
      <Link href="/auth/sign-in">
        <Button variant="ghost">Sign in</Button>
      </Link>
      <Link href="/auth/sign-up">
        <Button>Sign up</Button>
      </Link>
    </div>
  );
}
