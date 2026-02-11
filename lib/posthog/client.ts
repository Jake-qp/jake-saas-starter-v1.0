import posthog from "posthog-js";
import type { PostHog } from "posthog-js";

let posthogInstance: PostHog | null = null;

/**
 * Get or initialize the PostHog browser client singleton.
 * Returns null when NEXT_PUBLIC_POSTHOG_KEY is not set (graceful degradation).
 * Uses /ph reverse proxy to avoid ad-blockers.
 */
export function getPostHogClient(): PostHog | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!posthogInstance) {
    posthogInstance = posthog.init(key, {
      api_host: "/ph",
      ui_host: "https://us.posthog.com",
      capture_pageview: false, // Manual pageview capture for App Router
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }

  return posthogInstance;
}
