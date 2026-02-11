import { PostHog } from "@samhoque/convex-posthog";
import { components } from "./_generated/api";

/**
 * PostHog analytics instance for server-side event tracking from Convex.
 * Uses @samhoque/convex-posthog component for non-blocking event capture.
 *
 * Usage:
 * ```ts
 * import { posthog } from "./posthog";
 *
 * // In a mutation:
 * await posthog.trackUserEvent(ctx, {
 *   userId: user._id,
 *   event: "subscription_changed",
 *   properties: { tier: "pro" }
 * });
 * ```
 *
 * Events are sent via ctx.scheduler.runAfter (non-blocking).
 * Requires POSTHOG_API_KEY env var in Convex Dashboard.
 */
export const posthog = new PostHog(components.posthog);
