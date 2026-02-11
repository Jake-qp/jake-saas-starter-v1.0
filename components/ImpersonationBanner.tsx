"use client";

import { Button } from "@/components/ui/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";

export interface ImpersonationBannerProps {
  targetName: string;
  onExit: () => void;
}

/**
 * Banner shown at the top of the page when an admin is impersonating a user.
 * Displays who is being impersonated and a button to exit.
 * Impersonation is read-only and auto-expires after 30 minutes.
 */
export function ImpersonationBanner({
  targetName,
  onExit,
}: ImpersonationBannerProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-warning px-4 py-2 text-sm font-medium text-warning-foreground">
      <span>
        Viewing as <strong>{targetName}</strong> — Read-only mode
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onExit}
        className="h-7 gap-1 border-warning-foreground/30 bg-transparent text-warning-foreground hover:bg-warning-foreground/10"
      >
        <CrossCircledIcon className="h-3.5 w-3.5" />
        Exit
      </Button>
    </div>
  );
}
