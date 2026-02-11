"use client";

import { useState } from "react";
import Link from "next/link";
import { RocketIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for Phase 2 visual design — will be replaced with Convex query/mutation in Phase 4
const MOCK_HAS_NEW = true;

/**
 * WhatsNewBadge — shows a dot indicator in the app header when new changelog
 * entries exist since the user last dismissed. Clicking opens the changelog.
 */
export function WhatsNewBadge() {
  const [hasNew, setHasNew] = useState(MOCK_HAS_NEW);

  const handleDismiss = () => {
    // Phase 4: will call mutation to update user's lastSeenChangelogDate
    setHasNew(false);
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
