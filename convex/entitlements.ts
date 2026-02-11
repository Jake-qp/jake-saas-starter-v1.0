/**
 * Entitlement enforcement layer for billing.
 *
 * Sits between authorization (RBAC) and execution (business logic).
 * Authorization: "Can this user do this action?" (role-based)
 * Entitlement: "Can this team afford this action?" (tier-based)
 *
 * @see ADR-002 Polar for Team-Level Billing
 * @see ADR-007 Credit-Based AI Billing
 */

import { ConvexError } from "convex/values";
import {
  PLAN_CONFIG,
  getTeamTier,
  getAICreditCost,
  type LimitKey,
  type PlanTier,
} from "../lib/planConfig";
import { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./types";

/**
 * Check if a team has entitlement for a given limit key.
 * Throws ConvexError with usage details and upgrade URL on limit hit.
 *
 * Must be called AFTER auth + permission checks, BEFORE execution.
 */
export async function checkEntitlement(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">,
  key: LimitKey,
) {
  const team = await ctx.table("teams").getX(teamId);
  const tier = getTeamTier(team);
  const limit = PLAN_CONFIG[tier].limits[key];

  // -1 means unlimited
  if (limit === -1) return;

  const current = await getCurrentUsage(ctx, teamId, key);
  if (current >= limit) {
    throw new ConvexError({
      message: `You've reached the ${key} limit for the ${PLAN_CONFIG[tier].displayName} plan`,
      code: "PLAN_LIMIT_EXCEEDED",
      upgradeUrl: "/settings/billing",
      usage: { current, limit, key },
    });
  }
}

/**
 * Get current usage for a given limit key and team.
 */
export async function getCurrentUsage(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">,
  key: LimitKey,
): Promise<number> {
  switch (key) {
    case "members": {
      const members = await ctx
        .table("teams")
        .getX(teamId)
        .edge("members")
        .filter((q) => q.eq(q.field("deletionTime"), undefined));
      return members.length;
    }
    case "aiCredits":
      return await getCreditsUsedThisPeriod(ctx, teamId);
    case "notes":
      // Notes table doesn't exist yet (F001-011), return 0 for now
      return 0;
    case "storageQuotaMB":
      // Storage tracking doesn't exist yet (F001-017), return 0 for now
      return 0;
    default: {
      const _exhaustive: never = key;
      throw new Error("Unknown limit key: " + String(_exhaustive));
    }
  }
}

/**
 * Get credits used in the current billing period (calendar month).
 */
export async function getCreditsUsedThisPeriod(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">,
): Promise<number> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const usageRecords = await ctx
    .table("aiUsage", "teamTimestamp", (q) =>
      q.eq("teamId", teamId).gte("timestamp", periodStart),
    )
    .collect();

  return usageRecords.reduce((sum, record) => sum + record.creditsUsed, 0);
}

/**
 * Record AI credit usage after a request completes.
 * Uses actual model and token count for accurate billing.
 */
export async function decrementCredits(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  model: string,
  tokenCount: number,
) {
  const creditsUsed = getAICreditCost(model);
  await ctx.table("aiUsage").insert({
    teamId,
    model,
    creditsUsed,
    tokenCount,
    timestamp: Date.now(),
  });
}

/**
 * Get billing info for a team (used by billing page).
 */
export async function getTeamBillingInfo(
  ctx: QueryCtx,
  teamId: Id<"teams">,
): Promise<{
  tier: PlanTier;
  displayName: string;
  status: string;
  usage: Record<string, { current: number; limit: number }>;
}> {
  const team = await ctx.table("teams").getX(teamId);
  const tier = getTeamTier(team);
  const config = PLAN_CONFIG[tier];

  const membersUsage = await getCurrentUsage(ctx, teamId, "members");
  const creditsUsage = await getCurrentUsage(ctx, teamId, "aiCredits");

  return {
    tier,
    displayName: config.displayName,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    status: (team.subscriptionStatus as string | undefined) ?? "active",
    usage: {
      members: {
        current: membersUsage,
        limit: config.limits.members,
      },
      aiCredits: {
        current: creditsUsage,
        limit: config.limits.aiCredits,
      },
    },
  };
}
