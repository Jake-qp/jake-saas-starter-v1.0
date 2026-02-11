"use client";

import { useMemo } from "react";
import { getPostHogClient } from "../posthog/client";

/**
 * Hook that wraps PostHog feature flag evaluation.
 * Returns boolean — defaults to false when PostHog is not configured.
 * Note: Flags poll every ~30s (not realtime like Convex subscriptions).
 */
export function useFeatureFlag(key: string): boolean {
  return useMemo(() => {
    const posthog = getPostHogClient();
    if (!posthog) return false;
    return posthog.isFeatureEnabled(key) ?? false;
  }, [key]);
}
