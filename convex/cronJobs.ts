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
 * Placeholder: actual credit logic implemented in F001-003 (Polar Billing).
 */
export const resetMonthlyCredits = internalMutation({
  args: {},
  async handler(_ctx) {
    // Credit reset logic will be implemented by F001-003 (Polar Billing).
    // This cron entry ensures the job schedule exists in advance.
    console.log("Monthly credit reset: no-op (awaiting F001-003 billing)");
  },
});

/**
 * Sync subscription statuses with billing provider.
 * Runs every hour.
 * Placeholder: actual sync logic implemented in F001-003 (Polar Billing).
 */
export const syncSubscriptions = internalMutation({
  args: {},
  async handler(_ctx) {
    // Subscription sync logic will be implemented by F001-003 (Polar Billing).
    // This cron entry ensures the job schedule exists in advance.
    console.log("Subscription sync: no-op (awaiting F001-003 billing)");
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
