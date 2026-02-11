"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RocketIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Latest changelog date — updated at build time via lib/content.ts
// This is a hardcoded constant that gets set during the build process.
// In production, this would be generated from the actual changelog MDX files.
const LATEST_CHANGELOG_DATE = "2026-02-10";

/**
 * WhatsNewBadge — shows a dot indicator in the app header when new changelog
 * entries exist since the user last dismissed. Clicking opens the changelog.
 */
export function WhatsNewBadge() {
  const lastSeenDate = useQuery(api.changelog.getLastSeenDate);
  const dismissWhatsNew = useMutation(api.changelog.dismissWhatsNew);

  // Determine if there are new entries
  const hasNew =
    lastSeenDate !== undefined &&
    (lastSeenDate === null || lastSeenDate < LATEST_CHANGELOG_DATE);

  const handleDismiss = () => {
    void dismissWhatsNew({ date: LATEST_CHANGELOG_DATE });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            asChild
            onClick={handleDismiss}
          >
            <Link href="/changelog">
              <RocketIcon className="h-4 w-4" />
              {hasNew && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
              <span className="sr-only">What&apos;s new</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{hasNew ? "New updates available" : "Changelog"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
