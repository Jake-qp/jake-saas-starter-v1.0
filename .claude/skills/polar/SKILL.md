---
name: polar
description: Use when implementing billing, subscriptions, credits, checkout flows, or entitlement checks. Before writing any billing code.
---

# Polar Billing

## Overview

Billing is the load-bearing wall of a SaaS product. Get it wrong and you leak revenue, grant unauthorized access, or break the upgrade experience. This project uses Polar via `@convex-dev/polar` for team-level billing with a credit-based AI consumption model. Most billing code is not yet implemented -- the architecture is defined in ADR-002, ADR-007, and PRD F001-003. This skill ensures every billing implementation follows those decisions correctly.

## How Billing Engineers Think

**"Who owns the subscription?"**
In B2B SaaS, the team pays -- not the user. A user can belong to multiple teams, each with its own subscription. Every billing operation is scoped to a `teamId`, never a `userId`. The moment you see billing logic referencing a user directly, something is wrong.

**"What happens when the webhook is late?"**
Webhooks are not real-time guarantees. They arrive late, arrive twice, or arrive out of order. Every webhook handler must be idempotent. Polar's `@convex-dev/polar` component handles event ID deduplication and timestamp-based stale detection, but your business logic on top of it must also be safe to replay.

**"What does the user see when they hit a limit?"**
Hitting a plan limit is not an error -- it is a conversion opportunity. The message should tell the user what happened, what their current usage is, and how to upgrade. A generic "something went wrong" on a limit violation is lost revenue.

### What Separates Amateurs from Professionals

Amateurs build billing as a boolean: paid or not paid.
Professionals build billing as a graduated system: tiers, limits, credits, grace periods, and upgrade paths.

The amateur thinks: "Check if team has a subscription, then allow access."
The professional thinks: "Which tier is this team on? What are the limits for this specific resource? How many have they used in this billing period? Is there a grace period? What upgrade prompt do I show?"

When catching yourself writing `if (team.isPaid)` -- STOP. That is a boolean where a tier system belongs.

## When to Use

- Implementing the Polar component registration (`convex/convex.config.ts`)
- Building the entitlement check system (`convex/entitlements.ts`)
- Creating the plan configuration (`lib/planConfig.ts`)
- Wiring up Polar webhook handlers (`convex/http.ts`)
- Building checkout or customer portal flows
- Adding billing UI (settings page, usage meters, upgrade prompts)
- Writing any mutation that consumes a limited resource
- Implementing AI credit tracking and decrement
- **NOT** for auth logic (use auth patterns from CLAUDE.md)
- **NOT** for RBAC/permissions (those are separate from entitlements)

## Architecture Overview

### The Billing Stack

```
lib/planConfig.ts          -- Tier definitions, limits, credit costs (config, not code)
convex/entitlements.ts     -- checkEntitlement(), getCurrentUsage(), credit helpers
convex/billing.ts          -- Polar integration queries/mutations
convex/http.ts             -- Polar webhook route + handlers
convex/convex.config.ts    -- @convex-dev/polar component registration
app/t/[teamSlug]/settings/billing/page.tsx  -- Billing UI
```

### Data Flow

```
User action
  -> Mutation: authenticate -> authorize -> ENTITLE -> execute
                                              |
                                    checkEntitlement(ctx, teamId, "aiCredits")
                                              |
                              planConfig[team.subscriptionTier].limits.aiCredits
                                              |
                                    getCurrentUsage(ctx, teamId, "aiCredits")
                                              |
                              usage < limit? proceed : throw with upgrade prompt
```

### Team Schema Additions (to implement)

The `teams` table needs these billing fields:

```typescript
// In convex/schema.ts -- add to existing teams defineEnt:
polarCustomerId: v.optional(v.string()),
subscriptionTier: v.optional(v.string()),   // "free" | "pro" | "enterprise"
subscriptionStatus: v.optional(v.string()), // "active" | "canceled" | "past_due"
```

Default tier is `"free"` when `subscriptionTier` is undefined. Never require a Polar subscription to exist for free tier access.

## Quick Reference

| Situation | What to Do |
|-----------|------------|
| New mutation using limited resource | Add `checkEntitlement(ctx, teamId, "limitKey")` after auth + permission checks |
| AI request | Pre-check credits, execute, then decrement based on actual model + token count |
| Checkout flow | Generate Polar checkout URL server-side, redirect client, handle webhook on completion |
| Subscription change | Polar webhook fires `onSubscriptionUpdated` -> update `team.subscriptionTier` |
| Show usage to user | Query `getCurrentUsage(ctx, teamId, key)` and compare to plan limit |
| Team has no subscription | Treat as free tier (not as error) |
| Limit reached | Throw `ConvexError` with `code: "PLAN_LIMIT_EXCEEDED"`, `upgradeUrl`, and usage details |
| Credit cost lookup | Use `AI_CREDIT_COSTS[model]` from `planConfig.ts` -- never hardcode costs in mutations |

## Core Implementation Patterns

### 1. Plan Configuration (lib/planConfig.ts)

Single source of truth for all billing logic. Every tier, limit, feature gate, and credit cost lives here. See PRD Appendix A for full example.

```typescript
export const PLAN_CONFIG = {
  free:       { displayName: "Free",       price: 0,  limits: { members: 3,  aiCredits: 100,  notes: 50 }, features: ["basic", "notes"] },
  pro:        { displayName: "Pro",        price: 29, limits: { members: 20, aiCredits: 5000, notes: -1 }, features: ["basic", "notes", "ai", "api", "analytics"] },
  enterprise: { displayName: "Enterprise", price: 99, limits: { members: -1, aiCredits: -1,   notes: -1 }, features: ["basic", "notes", "ai", "api", "analytics", "custom-roles", "sso"] },
} as const;
// Each tier also needs a polarProductId from env vars

export type PlanTier = keyof typeof PLAN_CONFIG;
export type LimitKey = keyof typeof PLAN_CONFIG.free.limits;

export const AI_CREDIT_COSTS = {
  "gpt-4o": 10, "gpt-4o-mini": 2,
  "claude-sonnet-4-5-20250929": 8, "claude-haiku-4-5-20251001": 2,
} as const;

export function getTeamTier(team: { subscriptionTier?: string }): PlanTier {
  return (team.subscriptionTier as PlanTier) ?? "free";
}
```

### 2. Entitlement Check Pattern (convex/entitlements.ts)

This is the billing enforcement layer. It sits between authorization (RBAC) and execution (business logic).

```typescript
// convex/entitlements.ts
import { ConvexError } from "convex/values";
import { PLAN_CONFIG, getTeamTier, LimitKey } from "../lib/planConfig";

export async function checkEntitlement(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  key: LimitKey
) {
  const team = await ctx.table("teams").getX(teamId);
  const tier = getTeamTier(team);
  const limit = PLAN_CONFIG[tier].limits[key];

  // -1 means unlimited
  if (limit === -1) return;

  const current = await getCurrentUsage(ctx, teamId, key);
  if (current >= limit) {
    throw new ConvexError({
      message: `You've reached the ${key} limit for the ${tier} plan`,
      code: "PLAN_LIMIT_EXCEEDED",
      upgradeUrl: "/settings/billing",
      usage: { current, limit, key },
    });
  }
}
```

The `getCurrentUsage` function dispatches per limit key:

```typescript
async function getCurrentUsage(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  key: LimitKey
): Promise<number> {
  switch (key) {
    case "members":
      return await ctx.table("members", "teamUser", (q) =>
        q.eq("teamId", teamId)
      ).filter((q) => q.eq(q.field("deletionTime"), undefined)).count();
    case "aiCredits":
      return await getCreditsUsedThisPeriod(ctx, teamId);
    case "notes":
      return await ctx.table("notes", "team", (q) =>
        q.eq("teamId", teamId)
      ).count();
    default:
      throw new Error(`Unknown limit key: ${key}`);
  }
}
```

### 3. Credit System Pattern

Credits require a two-phase approach: pre-check before the AI request, decrement after completion.

```typescript
// Pre-check: before starting AI request
await checkEntitlement(ctx, teamId, "aiCredits");

// Post-completion: after AI response finishes
import { AI_CREDIT_COSTS } from "../lib/planConfig";

async function decrementCredits(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  model: string,
  tokenCount: number
) {
  const costPerRequest = AI_CREDIT_COSTS[model] ?? 5; // fallback cost
  await ctx.table("aiUsage").insert({
    teamId,
    model,
    creditsUsed: costPerRequest,
    tokenCount,
    timestamp: Date.now(),
  });
}
```

There is an inherent race condition: credits pass the pre-check but the actual usage pushes past the limit. This is acceptable. A scheduled reconciliation function corrects drift periodically.

### 4. Mutation Integration

Every mutation that touches a limited resource follows the established pattern from CLAUDE.md:

```typescript
export const createNote = mutation({
  args: { teamId: v.id("teams"), text: v.string() },
  handler: async (ctx, { teamId, text }) => {
    ctx.viewerX();                                          // 1. Authenticate
    await viewerHasPermissionX(ctx, teamId, "Contribute");  // 2. Authorize
    await checkEntitlement(ctx, teamId, "notes");           // 3. Entitle
    // 4. Rate limit (if needed)
    const note = await ctx.table("notes").insert({          // 5. Execute
      teamId, text, authorId: ctx.viewerX()._id,
    });
    // 6. Audit (if admin action)
    return note;
  },
});
```

Step 3 is the billing gate. It always comes after auth and permissions, before execution. Never combine it with authorization -- they answer different questions. Authorization: "Can this user do this action?" Entitlement: "Can this team afford this action?"

### 5. Polar Webhook Integration

The `@convex-dev/polar` component provides routing and idempotency. Your job is mapping events to team state.

```typescript
// convex/http.ts
const polar = new Polar(components.polar);

export default polar.registerRoutes(http, {
  path: "/polar/webhook",
  onSubscriptionCreated: async (ctx, event) => {
    const team = await ctx.table("teams").getX(/* from event metadata */);
    await team.patch({
      polarCustomerId: event.data.customer_id,
      subscriptionTier: mapProductToTier(event.data.product_id),
      subscriptionStatus: "active",
    });
  },
  onSubscriptionUpdated: async (ctx, event) => {
    const team = await getTeamByPolarCustomer(ctx, event.data.customer_id);
    await team.patch({
      subscriptionTier: mapProductToTier(event.data.product_id),
      subscriptionStatus: event.data.status,
    });
  },
  onSubscriptionCanceled: async (ctx, event) => {
    const team = await getTeamByPolarCustomer(ctx, event.data.customer_id);
    await team.patch({ subscriptionStatus: "canceled" });
    // Keep subscriptionTier until period ends -- Polar sends expiry event separately
  },
});
```

On cancellation, keep the current tier active until the billing period ends. Downgrading immediately is a refund request waiting to happen.

### 6. getUserInfo and Checkout

Polar's `getUserInfo` must map to the **team**, not the user:

```typescript
getUserInfo: async (ctx, polarUserId) => {
  const team = await ctx.table("teams").get(polarUserId as Id<"teams">);
  if (!team) return null;
  const owner = await getTeamOwner(ctx, team._id);
  return { userId: team._id, email: owner.email };
},
```

Checkout is a redirect flow: generate URL server-side, redirect client, complete via webhook.

```typescript
export const createCheckout = mutation({
  args: { teamId: v.id("teams"), planId: v.string() },
  handler: async (ctx, { teamId, planId }) => {
    ctx.viewerX();
    await viewerHasPermissionX(ctx, teamId, "Manage Team");
    return await polar.createCheckout(ctx, {
      productId: PLAN_CONFIG[planId].polarProductId,
      metadata: { teamId },
      successUrl: `${SITE_URL}/t/{teamSlug}/settings/billing?success=true`,
    });
  },
});
// Client: window.location.href = await createCheckout({ teamId, planId: "pro" });
```

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| Billing scoped to userId | Billing scoped to teamId | B2B SaaS bills teams, not users. A user on 3 teams has 3 separate subscriptions. |
| `if (team.isPaid)` boolean check | `checkEntitlement(ctx, teamId, "limitKey")` per resource | Different resources have different limits per tier. Binary paid/free misses the graduated model. |
| Downgrade tier immediately on cancel | Keep tier until period end, downgrade on expiry event | Users paid for the full period. Yanking access early is a refund request waiting to happen. |
| Hardcoded credit costs in mutations | `AI_CREDIT_COSTS[model]` from planConfig.ts | Credit costs change. One config file, not scattered magic numbers. |
| Generic error on limit hit | ConvexError with usage details + upgradeUrl | Limit violations are conversion events. Show what they used, what the limit is, and how to upgrade. |
| Entitlement check before auth | Auth -> Authorize -> Entitle (always this order) | An unauthenticated user should get a 401, not a "plan limit reached" message. |
| Free tier requires Polar subscription | Free tier is the default when `subscriptionTier` is undefined | No-subscription teams are free tier by definition. Don't gate basic access on Polar. |
| Webhook handler not idempotent | Use `@convex-dev/polar` built-in dedup + idempotent business logic | Webhooks replay. Processing the same event twice must produce the same result. |
| Credit check only (no decrement) | Pre-check credits, then decrement after actual usage | Without decrement, credits never decrease. Without pre-check, users start requests they cannot afford. |
| Mixing authorization and entitlement | Keep them separate: RBAC answers "can they?", entitlement answers "can they afford it?" | A team admin has permission to create notes but may have hit the notes limit. These are independent checks. |

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `POLAR_ACCESS_TOKEN` | Convex Dashboard | Polar API authentication |
| `POLAR_WEBHOOK_SECRET` | Convex Dashboard | Webhook signature verification |

Never put these in `.env.local`. They are Convex server-side only and belong in the Convex Dashboard environment variables.

## Exit Criteria

- [ ] `lib/planConfig.ts` defines all tiers, limits, features, and credit costs in one file
- [ ] `convex/entitlements.ts` exports `checkEntitlement()` that reads from planConfig
- [ ] `checkEntitlement` returns structured ConvexError with usage details and upgrade URL on limit hit
- [ ] `-1` values in limits correctly treated as unlimited (no check, immediate return)
- [ ] Free tier works without any Polar subscription (default when `subscriptionTier` is undefined)
- [ ] Every mutation that consumes a limited resource calls `checkEntitlement` after auth + permissions
- [ ] AI credit pre-check happens before request, decrement happens after completion with actual model/token count
- [ ] Polar webhooks update `subscriptionTier` and `subscriptionStatus` on teams table
- [ ] Cancellation keeps current tier until billing period expires
- [ ] Webhook handlers are idempotent (safe to replay)
- [ ] Checkout flow generates URL server-side, redirects client-side, completes via webhook
- [ ] Billing UI shows current plan, usage meters, and upgrade paths
- [ ] All billing tests cover permission + entitlement enforcement per CLAUDE.md testing requirements

**Done when:** A team can sign up on free, hit limits with clear upgrade prompts, check out via Polar, receive webhook-driven tier upgrade, use AI credits that decrement correctly, and the entire flow survives webhook replay without corruption.
