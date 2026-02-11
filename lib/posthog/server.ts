import { PostHog } from "posthog-node";

let serverInstance: PostHog | null = null;

/**
 * Get or initialize the PostHog server-side client singleton.
 * Returns null when POSTHOG_API_KEY is not set (graceful degradation).
 * Uses flushAt: 1 for serverless compatibility.
 */
export function getPostHogServerClient(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;

  if (!serverInstance) {
    serverInstance = new PostHog(key, {
      host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return serverInstance;
}
