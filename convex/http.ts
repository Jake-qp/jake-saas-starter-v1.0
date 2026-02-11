import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { polar } from "./billing";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

// Polar webhook routes — handles subscription lifecycle events.
// The @convex-dev/polar component provides event ID deduplication
// and timestamp-based stale detection for idempotent processing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
polar.registerRoutes(http as any, {
  path: "/polar/events",
  onSubscriptionCreated: async (ctx, event) => {
    // Map Polar product to tier and update the team.
    // The teamId is stored in checkout metadata.
    const metadata = event.data.metadata as Record<string, string> | undefined;
    const teamId = metadata?.teamId;
    if (!teamId) {
      console.error(
        "Polar webhook: subscription created without teamId in metadata",
      );
      return;
    }
    await ctx.runMutation(internal.billing.updateTeamSubscription, {
      teamId: teamId as never,
      polarCustomerId: event.data.customerId,
      subscriptionTier: mapProductToTier(event.data.productId),
      subscriptionStatus: "active",
    });
  },
  onSubscriptionUpdated: async (ctx, event) => {
    // Find team by Polar customer ID and update subscription state.
    const metadata = event.data.metadata as Record<string, string> | undefined;
    const teamId = metadata?.teamId;
    if (!teamId) {
      console.error(
        "Polar webhook: subscription updated without teamId in metadata",
      );
      return;
    }
    await ctx.runMutation(internal.billing.updateTeamSubscription, {
      teamId: teamId as never,
      subscriptionTier: mapProductToTier(event.data.productId),
      subscriptionStatus: mapPolarStatus(event.data.status),
    });
  },
});

/**
 * Map Polar product ID to subscription tier.
 * Product IDs are configured in Polar dashboard and matched here.
 * Falls back to "pro" for unrecognized products.
 */
function mapProductToTier(productId: string): string {
  // Product IDs will be configured via environment variables in production.
  // For now, use a simple mapping that can be extended.
  const productTierMap: Record<string, string> = {
    // These will be populated with actual Polar product IDs
    // e.g., "pol_product_abc123": "pro",
    // e.g., "pol_product_def456": "enterprise",
  };
  return productTierMap[productId] ?? "pro";
}

/**
 * Map Polar subscription status to our internal status values.
 */
function mapPolarStatus(polarStatus: string): string {
  switch (polarStatus) {
    case "active":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    case "trialing":
      return "trialing";
    case "incomplete":
      return "past_due";
    default:
      return "active";
  }
}

export default http;
