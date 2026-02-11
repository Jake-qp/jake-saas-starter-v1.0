/**
 * Server-side helpers for PostHog feature flag admin management.
 * Used by API routes at /api/admin/flags/ — NEVER imported on client side.
 *
 * Requires POSTHOG_PERSONAL_API_KEY (server-only env var, never NEXT_PUBLIC_).
 * Requires POSTHOG_PROJECT_ID to target the correct PostHog project.
 */

const POSTHOG_API_BASE = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * PostHog feature flags API URL for the configured project.
 */
export const POSTHOG_FLAGS_API_URL = `${POSTHOG_API_BASE}/api/projects/${process.env.POSTHOG_PROJECT_ID || ""}/feature_flags/`;

/**
 * Returns auth headers for PostHog personal API requests.
 * Returns null when POSTHOG_PERSONAL_API_KEY is not set.
 */
export function getPostHogHeaders(): {
  Authorization: string;
  "Content-Type": string;
} | null {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!key) return null;
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}
