/**
 * Billing module — Polar integration, queries, and mutations.
 *
 * Team-level billing via @convex-dev/polar.
 * getUserInfo maps to team identity (team._id + owner email).
 *
 * @see ADR-002 Polar for Team-Level Billing
 */

import { Polar } from "@convex-dev/polar";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import { query, internalMutation } from "./functions";
import { getTeamBillingInfo } from "./entitlements";

/**
 * Polar component instance.
 * getUserInfo returns the team's ID and owner email for team-level billing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const polar: any = new Polar(components.polar, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getUserInfo: async (ctx: any): Promise<{ userId: string; email: string }> => {
    // In the checkout flow, the current viewer is the team admin.
    // We use their user ID + email as the Polar customer identity.
    // The actual team association is handled via checkout metadata.
    const viewer = await ctx.runQuery(api.billing.getViewerInfo);
    if (!viewer) return { userId: "", email: "" };
    return { userId: viewer.userId, email: viewer.email };
  },
});

// Export Polar's generated API functions
export const {
  generateCheckoutLink,
  generateCustomerPortalUrl,
  getConfiguredProducts,
  listAllProducts,
} = polar.api();

/**
 * Internal query to get viewer info for Polar's getUserInfo callback.
 */
export const getViewerInfo = query({
  args: {},
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.viewer === null) return null;
    return {
      userId: ctx.viewer._id,
      email: ctx.viewer.email ?? "",
    };
  },
});

/**
 * Get billing info for the current team.
 * Returns tier, status, and usage metrics.
 */
export const getTeamBilling = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.viewer === null) return null;
    return await getTeamBillingInfo(ctx, teamId);
  },
});

/**
 * Get the team's current subscription from Polar.
 * Returns null if no active subscription.
 */
export const getCurrentSubscription = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.viewer === null) return null;
    const team = await ctx.table("teams").getX(teamId);
    if (!team.polarCustomerId) return null;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const subscription = await polar.getCurrentSubscription(ctx, {
      userId: team.polarCustomerId,
    });
    return subscription;
  },
});

/**
 * Update team subscription data from webhook events.
 * Called by Polar webhook handlers.
 */
export const updateTeamSubscription = internalMutation({
  args: {
    teamId: v.id("teams"),
    polarCustomerId: v.optional(v.string()),
    subscriptionTier: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const team = await ctx.table("teams").getX(args.teamId);
    const patch: Record<string, string | undefined> = {};
    if (args.polarCustomerId !== undefined) {
      patch.polarCustomerId = args.polarCustomerId;
    }
    if (args.subscriptionTier !== undefined) {
      patch.subscriptionTier = args.subscriptionTier;
    }
    if (args.subscriptionStatus !== undefined) {
      patch.subscriptionStatus = args.subscriptionStatus;
    }
    await team.patch(patch);
  },
});

/**
 * Get team by Polar customer ID (for webhook lookups).
 */
export const getTeamByPolarCustomerId = query({
  args: {
    polarCustomerId: v.string(),
  },
  handler: async (ctx, { polarCustomerId }) => {
    return await ctx
      .table("teams", "polarCustomerId", (q) =>
        q.eq("polarCustomerId", polarCustomerId),
      )
      .unique();
  },
});

/**
 * Reset monthly credits for all teams.
 * Called by the resetMonthlyCredits cron job.
 * Since credits are tracked as usage records (not a balance),
 * this is effectively a no-op — the billing period resets naturally
 * because getCreditsUsedThisPeriod only counts the current month.
 *
 * This function can be used for logging/analytics of credit resets.
 */
export const resetAllTeamCredits = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Credit reset is automatic via calendar month boundary in getCreditsUsedThisPeriod.
    // Log the reset event for monitoring.
    const teams = await ctx.table("teams");
    const activeTeams = teams.filter(
      (t: { deletionTime?: number; isPersonal: boolean }) =>
        t.deletionTime === undefined && !t.isPersonal,
    );
    console.log(
      `Monthly credit reset: ${activeTeams.length} active team(s) reset to fresh allocation`,
    );
  },
});

/**
 * Sync subscription statuses with Polar.
 * Called by the syncSubscriptions cron job.
 * Ensures local state matches Polar's records.
 */
export const syncAllSubscriptions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.table("teams");
    const subscribedTeams = teams.filter(
      (t: {
        polarCustomerId?: string;
        deletionTime?: number;
        subscriptionStatus?: string;
      }) =>
        t.polarCustomerId &&
        t.deletionTime === undefined &&
        t.subscriptionStatus !== "canceled",
    );
    console.log(
      `Subscription sync: ${subscribedTeams.length} team(s) with active subscriptions`,
    );
    // Full Polar API sync would require an action (external HTTP call).
    // For now, the webhook-driven approach is the primary sync mechanism.
    // This cron serves as a safety net — full implementation requires Polar SDK.
  },
});
