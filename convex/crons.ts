import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily: Cleanup expired invites (older than 7 days)
crons.daily(
  "cleanup expired invites",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cronJobs.cleanupExpiredInvites,
);

// Monthly: Reset credits for all teams (1st of month, midnight UTC)
crons.monthly(
  "reset monthly credits",
  { day: 1, hourUTC: 0, minuteUTC: 0 },
  internal.cronJobs.resetMonthlyCredits,
);

// Hourly: Sync subscription statuses with billing provider
crons.hourly(
  "sync subscriptions",
  { minuteUTC: 15 },
  internal.cronJobs.syncSubscriptions,
);

// Daily: Cleanup stale auth sessions (expired > 24h ago)
crons.daily(
  "cleanup stale sessions",
  { hourUTC: 4, minuteUTC: 0 },
  internal.cronJobs.cleanupStaleSessions,
);

export default crons;
