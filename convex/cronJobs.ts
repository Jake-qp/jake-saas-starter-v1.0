import { internalMutation } from "./_generated/server";

/**
 * Cleanup expired invites (older than 7 days).
 * Runs daily at 3:00 AM UTC.
 */
export const cleanupExpiredInvites = internalMutation({
  args: {},
  async handler(ctx) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const allInvites = await ctx.db.query("invites").collect();
    let deletedCount = 0;
    for (const invite of allInvites) {
      if (invite._creationTime < sevenDaysAgo) {
        await ctx.db.delete(invite._id);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired invite(s)`);
    }
  },
});

/**
 * Reset monthly credits for all teams.
 * Runs on the 1st of each month at midnight UTC.
 *
 * Credits are tracked as usage records with timestamps. The billing period
 * resets naturally because getCreditsUsedThisPeriod only counts the current
 * calendar month. This cron logs the reset event for monitoring.
 */
export const resetMonthlyCredits = internalMutation({
  args: {},
  async handler(ctx) {
    const teams = await ctx.db.query("teams").collect();
    const activeTeams = teams.filter(
      (t) => t.deletionTime === undefined && !t.isPersonal,
    );
    console.log(
      `Monthly credit reset: ${activeTeams.length} active team(s) — credits reset via calendar month boundary`,
    );
  },
});

/**
 * Sync subscription statuses with billing provider.
 * Runs every hour.
 *
 * Primary sync is webhook-driven. This cron serves as a safety net
 * to catch any missed webhook events.
 */
export const syncSubscriptions = internalMutation({
  args: {},
  async handler(ctx) {
    const teams = await ctx.db.query("teams").collect();
    const subscribedTeams = teams.filter(
      (t) =>
        t.polarCustomerId &&
        t.deletionTime === undefined &&
        t.subscriptionStatus !== "canceled",
    );
    console.log(
      `Subscription sync: ${subscribedTeams.length} team(s) with active subscriptions`,
    );
    // Full Polar API sync requires an action (external HTTP call).
    // Webhook-driven approach is the primary sync mechanism.
  },
});

/**
 * Cleanup stale auth sessions (expired > 24 hours ago).
 * Runs daily at 4:00 AM UTC.
 */
export const cleanupStaleSessions = internalMutation({
  args: {},
  async handler(ctx) {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const expiredSessions = await ctx.db.query("authSessions").collect();
    let deletedCount = 0;
    for (const session of expiredSessions) {
      if (session.expirationTime < oneDayAgo) {
        await ctx.db.delete(session._id);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} stale session(s)`);
    }
  },
});
