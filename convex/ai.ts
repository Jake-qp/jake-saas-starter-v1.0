/**
 * AI chat backend — shared mutations for both streaming patterns.
 *
 * Both the Next.js API route (default) and the Convex HTTP action (alternative)
 * call these mutations for saving messages and tracking usage.
 *
 * Pattern: authenticate → authorize → entitle → rate limit → execute
 *
 * @see ADR-004 Dual AI Streaming Patterns
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./functions";
import { viewerHasPermissionX } from "./permissions";
import { checkEntitlement, decrementCredits } from "./entitlements";
import { rateLimiter } from "./rateLimit";

/**
 * List AI messages for a team in chronological order.
 */
export const listMessages = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    ctx.viewerX();
    return await ctx
      .table("aiMessages", "teamId", (q) => q.eq("teamId", teamId))
      .map(async (message) => ({
        _id: message._id,
        _creationTime: message._creationTime,
        role: message.role,
        content: message.content,
        model: message.model,
      }));
  },
});

/**
 * Save a user message. Called before sending to the AI provider.
 * Performs full auth → permission → entitlement → rate limit checks.
 */
export const saveUserMessage = mutation({
  args: {
    teamId: v.id("teams"),
    content: v.string(),
  },
  handler: async (ctx, { teamId, content }) => {
    // 1. Authenticate
    ctx.viewerX();
    // 2. Authorize
    await viewerHasPermissionX(ctx, teamId, "Use AI");
    // 3. Entitle
    await checkEntitlement(ctx, teamId, "aiCredits");
    // 4. Rate limit
    await rateLimiter.limit(ctx, "aiRequest", {
      key: teamId,
      throws: true,
    });
    // 5. Execute
    if (content.trim().length === 0) {
      throw new Error("Message must not be empty");
    }
    return await ctx.table("aiMessages").insert({
      teamId,
      role: "user",
      content: content.trim(),
    });
  },
});

/**
 * Save an assistant response. Called after the AI provider finishes streaming.
 * Also records credit usage for billing.
 */
export const saveAssistantMessage = mutation({
  args: {
    teamId: v.id("teams"),
    content: v.string(),
    model: v.string(),
    tokenCount: v.number(),
  },
  handler: async (ctx, { teamId, content, model, tokenCount }) => {
    // 1. Authenticate
    ctx.viewerX();
    // 2. Save the assistant message
    await ctx.table("aiMessages").insert({
      teamId,
      role: "assistant",
      content,
      model,
    });
    // 3. Record credit usage
    await decrementCredits(ctx, teamId, model, tokenCount);
  },
});

/**
 * Get AI credit usage for the current billing period.
 */
export const getCreditUsage = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    ctx.viewerX();
    const { getTeamBillingInfo } = await import("./entitlements");
    const billingInfo = await getTeamBillingInfo(ctx, teamId);
    return {
      current: billingInfo.usage.aiCredits.current,
      limit: billingInfo.usage.aiCredits.limit,
    };
  },
});

/**
 * Internal mutation for saving assistant messages from HTTP actions.
 * Used by the alternative Convex HTTP streaming pattern.
 */
export const internalSaveAssistantMessage = internalMutation({
  args: {
    teamId: v.id("teams"),
    content: v.string(),
    model: v.string(),
    tokenCount: v.number(),
  },
  handler: async (ctx, { teamId, content, model, tokenCount }) => {
    await ctx.table("aiMessages").insert({
      teamId,
      role: "assistant",
      content,
      model,
    });
    await decrementCredits(ctx, teamId, model, tokenCount);
  },
});
