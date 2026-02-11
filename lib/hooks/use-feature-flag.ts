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

/**
 * Hook that wraps PostHog feature flag payload evaluation.
 * Returns JSON payload for flags with payloads, or null when:
 * - PostHog is not configured
 * - Flag doesn't exist
 * - Flag has no payload
 */
export function useFeatureFlagWithPayload(key: string): unknown {
  return useMemo(() => {
    const posthog = getPostHogClient();
    if (!posthog) return null;
    return posthog.getFeatureFlagPayload(key) ?? null;
  }, [key]);
}
