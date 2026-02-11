import { v } from "convex/values";
import { query, adminQuery, adminMutation } from "./functions";

/** Impersonation auto-expires after 30 minutes (AC10) */
export const IMPERSONATION_DURATION_MS = 30 * 60 * 1000;

/**
 * Check if the current user is a super admin.
 * Returns false for unauthenticated users.
 */
export const isSuperAdmin = query({
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return false;
    return ctx.viewer.isSuperAdmin === true;
  },
});

/**
 * Dashboard metrics: user, team, and revenue counts (AC3).
 * Super admin only.
 */
export const dashboardMetrics = adminQuery({
  handler: async (ctx) => {
    const allUsers = await ctx.table("users").map((u) => ({
      _id: u._id,
      _creationTime: u._creationTime,
    }));
    const totalUsers = allUsers.length;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const signupsToday = allUsers.filter(
      (u) => u._creationTime >= todayStart.getTime(),
    ).length;

    const allTeams = await ctx.table("teams").map((t) => ({
      _id: t._id,
      isPersonal: t.isPersonal,
      subscriptionTier: t.subscriptionTier,
      subscriptionStatus: t.subscriptionStatus,
      _creationTime: t._creationTime,
    }));
    const totalTeams = allTeams.length;
    const paidTeams = allTeams.filter(
      (t) =>
        t.subscriptionTier &&
        t.subscriptionTier !== "free" &&
        t.subscriptionStatus === "active",
    ).length;

    // Active teams = created or have members active in last 30 days
    // Simplified: teams with active subscriptions
    const activeTeams = allTeams.filter(
      (t) =>
        t.subscriptionStatus === "active" || t._creationTime >= thirtyDaysAgo,
    ).length;

    const auditEvents = await ctx.table("auditLog").map((a) => a._id);
    const totalAuditEvents = auditEvents.length;

    return {
      totalUsers,
      activeUsers: totalUsers, // All registered users counted as active (simplified)
      signupsToday,
      totalTeams,
      activeTeams,
      paidTeams,
      totalAuditEvents,
    };
  },
});

/**
 * List all users for admin management (AC7).
 * Super admin only.
 */
export const listUsers = adminQuery({
  handler: async (ctx) => {
    const users = await ctx.table("users").map(async (u) => {
      return {
        _id: u._id,
        email: u.email,
        fullName: u.fullName ?? u.name ?? "Unknown",
        isSuperAdmin: u.isSuperAdmin === true,
        _creationTime: u._creationTime,
      };
    });
    return users;
  },
});

/**
 * List all teams for admin management.
 * Super admin only.
 */
export const listTeams = adminQuery({
  handler: async (ctx) => {
    const teams = await ctx.table("teams").map(async (t) => {
      const members = await t.edge("members");
      // Find owner: member with Owner role
      let ownerName = "Unknown";
      let ownerEmail = "";
      for (const member of members) {
        const role = await member.edge("role");
        if (role.name === "Owner") {
          const user = await member.edge("user");
          ownerName = user.fullName ?? user.name ?? "Unknown";
          ownerEmail = user.email ?? "";
          break;
        }
      }
      return {
        _id: t._id,
        name: t.name,
        slug: t.slug,
        isPersonal: t.isPersonal,
        memberCount: members.length,
        subscriptionTier: t.subscriptionTier ?? "free",
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
        subscriptionStatus: t.subscriptionStatus ?? "active",
        ownerName,
        ownerEmail,
        _creationTime: t._creationTime,
      };
    });
    return teams;
  },
});

/**
 * List audit log entries, newest first.
 * Super admin only.
 */
export const listAuditLog = adminQuery({
  handler: async (ctx) => {
    const entries = await ctx
      .table("auditLog")
      .order("desc")
      .map(async (entry) => {
        // Resolve actor name
        let actorName = "Unknown";
        let actorEmail = "";
        try {
          const actor = await ctx.table("users").get(entry.actorId);
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
          if (actor) {
            actorName = actor.fullName ?? actor.name ?? "Unknown";
            actorEmail = actor.email ?? "";
          }
        } catch {
          // User may have been deleted
        }

        // Resolve target name
        let targetName: string | null = null;
        let targetEmail: string | null = null;
        if (entry.targetUserId) {
          try {
            const target = await ctx.table("users").get(entry.targetUserId);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
            if (target) {
              targetName = target.fullName ?? target.name ?? "Unknown";
              targetEmail = target.email ?? "";
            }
          } catch {
            // User may have been deleted
          }
        }

        return {
          _id: entry._id,
          action: entry.action,
          actorName,
          actorEmail,
          targetName,
          targetEmail,
          metadata: entry.metadata,
          timestamp: entry.timestamp,
        };
      });
    return entries;
  },
});

/**
 * Start impersonation of a user (AC7, AC10, AC11).
 * Super admin only. Records audit log entry.
 * Sets 30-minute expiry on the impersonation session.
 */
export const startImpersonation = adminMutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = ctx.viewerX();

    // Cannot impersonate yourself
    if (admin._id === args.targetUserId) {
      throw new Error("Cannot impersonate yourself");
    }

    // Verify target user exists
    const target = await ctx.table("users").get(args.targetUserId);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (!target) {
      throw new Error("Target user not found");
    }

    const now = Date.now();
    const expiresAt = now + IMPERSONATION_DURATION_MS;

    // Set impersonation state on admin user
    await admin.patch({
      impersonatingUserId: args.targetUserId,
      impersonationExpiresAt: expiresAt,
    });

    // Audit log (AC11)
    await ctx.table("auditLog").insert({
      actorId: admin._id,
      action: "impersonation_start",
      targetUserId: args.targetUserId,
      metadata: {
        targetEmail: target.email,
        targetName: target.fullName ?? target.name,
      },
      timestamp: now,
    });

    return { expiresAt };
  },
});

/**
 * Stop impersonation (AC11).
 * Super admin only. Records audit log entry.
 */
export const stopImpersonation = adminMutation({
  args: {},
  handler: async (ctx) => {
    const admin = ctx.viewerX();

    if (!admin.impersonatingUserId) {
      throw new Error("Not currently impersonating anyone");
    }

    const targetUserId = admin.impersonatingUserId;

    // Clear impersonation state
    await admin.patch({
      impersonatingUserId: undefined,
      impersonationExpiresAt: undefined,
    });

    // Audit log (AC11)
    await ctx.table("auditLog").insert({
      actorId: admin._id,
      action: "impersonation_stop",
      targetUserId,
      metadata: { reason: "manual_exit" },
      timestamp: Date.now(),
    });
  },
});

/**
 * Get current impersonation status for the admin user.
 * Returns null if not impersonating, or target user info if active.
 */
export const getImpersonationStatus = query({
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return null;
    if (ctx.viewer.isSuperAdmin !== true) return null;

    const userId = ctx.viewer.impersonatingUserId;
    const expiresAt = ctx.viewer.impersonationExpiresAt;

    if (!userId || !expiresAt) return null;

    // Check if expired (AC10)
    if (Date.now() > expiresAt) {
      return { expired: true, targetName: null, targetEmail: null, expiresAt };
    }

    // Resolve target user
    try {
      const target = await ctx.table("users").get(userId);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
      if (!target) return null;
      return {
        expired: false,
        targetName: target.fullName ?? target.name ?? "Unknown",
        targetEmail: target.email ?? "",
        targetUserId: userId,
        expiresAt,
      };
    } catch {
      return null;
    }
  },
});
