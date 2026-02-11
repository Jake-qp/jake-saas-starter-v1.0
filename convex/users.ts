import { v } from "convex/values";
import { internalMutation, mutation, query } from "./functions";
import { defaultToAccessTeamSlug } from "./users/teams";

// Called after sign-in to get the team slug for redirect.
// User and personal team creation is handled by the afterUserCreatedOrUpdated
// callback in convex/auth.ts.
export const getTeamSlug = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = ctx.viewerX();
    return defaultToAccessTeamSlug(viewer);
  },
});

// Alias for backward compatibility — app/t/page.tsx calls api.users.store
export const store = getTeamSlug;

// Get current user profile data
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.viewer === null) return null;
    return {
      _id: ctx.viewer._id,
      email: ctx.viewer.email,
      fullName: ctx.viewer.fullName,
      firstName: ctx.viewer.firstName,
      lastName: ctx.viewer.lastName,
      pictureUrl: ctx.viewer.pictureUrl,
      timezone: ctx.viewer.timezone,
      onboardingStatus: ctx.viewer.onboardingStatus,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = ctx.viewerX();
    const updates: Record<string, string | undefined> = {};
    if (args.fullName !== undefined) updates.fullName = args.fullName;
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.timezone !== undefined) updates.timezone = args.timezone;
    await viewer.patch(updates);
  },
});

// List active sessions for the current user
export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.viewer === null) return null;
    // Query authSessions table via raw db (it's an auth table, not an ent)
    const sessions = await ctx.table("authSessions", "userId", (q) =>
      q.eq("userId", ctx.viewer!._id),
    );
    const now = Date.now();
    return sessions
      .filter((s) => s.expirationTime > now)
      .map((s) => ({
        _id: s._id,
        _creationTime: s._creationTime,
        expirationTime: s.expirationTime,
      }));
  },
});

export const foo = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.table("as", "b", (q) => q.eq("_creationTime" as any, 3 as any));
  },
});
