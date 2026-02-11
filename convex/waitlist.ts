import { v, ConvexError } from "convex/values";
import { query, mutation, adminQuery, adminMutation } from "./functions";

/**
 * Public mutation: Join the waitlist with an email address.
 * No authentication required. Stores entry with "pending" status.
 * Returns { status: "joined" } on success, or { status: "duplicate" } if email already exists.
 */
export const joinWaitlist = mutation({
  args: {
    email: v.string(),
  },
  async handler(ctx, { email }) {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate email (AC3)
    const existing = await ctx
      .table("waitlistEntries", "email", (q) => q.eq("email", normalizedEmail))
      .unique();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (existing !== null) {
      return { status: "duplicate" as const };
    }

    // Insert new entry with status "pending" (AC2)
    await ctx.table("waitlistEntries").insert({
      email: normalizedEmail,
      status: "pending",
    });

    return { status: "joined" as const };
  },
});

/**
 * Public query: Get total waitlist count (for display on waitlist page).
 * No authentication required.
 */
export const getWaitlistCount = query({
  args: {},
  async handler(ctx) {
    const entries = await ctx.table("waitlistEntries").map((e) => e._id);
    return entries.length;
  },
});

/**
 * Admin query: List all waitlist entries for admin management (AC4).
 * Super admin only.
 */
export const listWaitlistEntries = adminQuery({
  args: {},
  async handler(ctx) {
    const entries = await ctx
      .table("waitlistEntries")
      .order("desc")
      .map((entry) => ({
        _id: entry._id,
        email: entry.email,
        status: entry.status,
        _creationTime: entry._creationTime,
      }));
    return entries;
  },
});

/**
 * Admin mutation: Approve a waitlist entry (AC4, AC5).
 * Changes status to "approved". Invitation email is sent via API route.
 * Super admin only.
 */
export const approveEntry = adminMutation({
  args: {
    entryId: v.id("waitlistEntries"),
  },
  async handler(ctx, { entryId }) {
    const entry = await ctx.table("waitlistEntries").getX(entryId);

    if (entry.status !== "pending") {
      throw new ConvexError({
        message: "Entry is not in pending status",
        code: "INVALID_STATE",
      });
    }

    await entry.patch({ status: "approved" });

    return { email: entry.email };
  },
});

/**
 * Admin mutation: Reject a waitlist entry (AC4).
 * Changes status to "rejected".
 * Super admin only.
 */
export const rejectEntry = adminMutation({
  args: {
    entryId: v.id("waitlistEntries"),
  },
  async handler(ctx, { entryId }) {
    const entry = await ctx.table("waitlistEntries").getX(entryId);

    if (entry.status !== "pending") {
      throw new ConvexError({
        message: "Entry is not in pending status",
        code: "INVALID_STATE",
      });
    }

    await entry.patch({ status: "rejected" });
  },
});
