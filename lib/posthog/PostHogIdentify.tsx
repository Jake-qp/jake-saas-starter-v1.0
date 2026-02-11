"use client";

import { useEffect } from "react";
import { getPostHogClient } from "./client";

interface PostHogIdentifyProps {
  userId: string | null;
  email?: string | null;
  name?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  subscriptionTier?: string | null;
}

/**
 * Identifies the authenticated user and links them to their team group.
 * - posthog.identify() links events to the authenticated user (AC4)
 * - posthog.group("team", teamId) enables team-level analytics (AC5)
 * - Resets when user logs out (userId becomes null)
 */
export function PostHogIdentify({
  userId,
  email,
  name,
  teamId,
  teamName,
  subscriptionTier,
}: PostHogIdentifyProps) {
  useEffect(() => {
    const posthog = getPostHogClient();
    if (!posthog) return;

    if (userId) {
      posthog.identify(userId, {
        ...(email && { email }),
        ...(name && { name }),
      });

      if (teamId) {
        posthog.group("team", teamId, {
          ...(teamName && { name: teamName }),
          ...(subscriptionTier && { subscription_tier: subscriptionTier }),
        });
      }
    } else {
      posthog.reset();
    }
  }, [userId, email, name, teamId, teamName, subscriptionTier]);

  return null;
}
