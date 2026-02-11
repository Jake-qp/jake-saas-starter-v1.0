"use client";

import { useCallback } from "react";
import { getPostHogClient } from "../posthog/client";

/**
 * Hook that wraps posthog.capture() for event tracking.
 * Returns a fire-and-forget function: (event, properties?) => void
 * No-op when PostHog is not configured (AC2).
 */
export function useTrack() {
  return useCallback((event: string, properties?: Record<string, unknown>) => {
    const posthog = getPostHogClient();
    if (!posthog) return;
    posthog.capture(event, properties);
  }, []);
}
