import { v } from "convex/values";
import { mutation, query } from "./functions";
import {
  mutation as baseMutation,
  query as baseQuery,
} from "./_generated/server";
import { entsTableFactory } from "convex-ents";
import { entDefinitions } from "./schema";

/**
 * Subscribe to changelog email updates (public, no auth required).
 * Returns { status: "subscribed" | "already_subscribed" }
 */
export const subscribe = baseMutation({
  args: { email: v.string() },
  handler: async (baseCtx, { email }) => {
    const ctx = {
      ...baseCtx,
      db: undefined as never,
      table: entsTableFactory(baseCtx, entDefinitions),
    };

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing subscriber
    const existing = await ctx
      .table("changelogSubscribers")
      .get("email", normalizedEmail);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (existing) {
      return { status: "already_subscribed" as const };
    }

    // Generate unsubscribe token (crypto not available in Convex, use random string)
    const token = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");

    await ctx.table("changelogSubscribers").insert({
      email: normalizedEmail,
      unsubscribeToken: token,
      subscribedAt: Date.now(),
    });

    return { status: "subscribed" as const };
  },
});

/**
 * Unsubscribe from changelog emails via token (public, no auth required).
 * Returns { status: "unsubscribed" | "not_found" }
 */
export const unsubscribe = baseMutation({
  args: { token: v.string() },
  handler: async (baseCtx, { token }) => {
    const ctx = {
      ...baseCtx,
      db: undefined as never,
      table: entsTableFactory(baseCtx, entDefinitions),
    };

    const subscriber = await ctx
      .table("changelogSubscribers")
      .get("unsubscribeToken", token);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (!subscriber) {
      return { status: "not_found" as const };
    }

    await subscriber.delete();
    return { status: "unsubscribed" as const };
  },
});

/**
 * Get the user's lastSeenChangelogDate (authenticated).
 */
export const getLastSeenDate = query({
  args: {},
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return null;
    return ctx.viewer.lastSeenChangelogDate ?? null;
  },
});

/**
 * Update the user's lastSeenChangelogDate (authenticated).
 * Called when user dismisses the WhatsNewBadge.
 */
export const dismissWhatsNew = mutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const viewer = ctx.viewerX();
    await viewer.patch({ lastSeenChangelogDate: date });
  },
});

/**
 * Check if a specific email is subscribed (used for checking subscription status).
 * Public query, no auth required.
 */
export const isSubscribed = baseQuery({
  args: { email: v.string() },
  handler: async (baseCtx, { email }) => {
    const ctx = {
      ...baseCtx,
      db: undefined as never,
      table: entsTableFactory(baseCtx, entDefinitions),
    };
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await ctx
      .table("changelogSubscribers")
      .get("email", normalizedEmail);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    return existing !== null;
  },
});
