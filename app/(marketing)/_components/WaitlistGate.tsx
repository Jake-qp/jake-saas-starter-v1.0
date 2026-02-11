"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFeatureFlag } from "@/lib/hooks/use-feature-flag";

/**
 * Client-side gate that redirects to /waitlist when `waitlist_mode` flag is enabled (AC1).
 * Renders nothing — purely a redirect mechanism.
 * When the flag is off (or PostHog is unconfigured), does nothing (AC6).
 */
export function WaitlistGate() {
  const waitlistMode = useFeatureFlag("waitlist_mode");
  const router = useRouter();

  useEffect(() => {
    if (waitlistMode) {
      router.replace("/waitlist");
    }
  }, [waitlistMode, router]);

  return null;
}
