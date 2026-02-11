/**
 * Plan configuration — single source of truth for all billing logic.
 * Every tier, limit, feature gate, and AI credit cost lives here.
 *
 * @see ADR-002 Polar for Team-Level Billing
 * @see ADR-007 Credit-Based AI Billing
 */

export const PLAN_CONFIG = {
  free: {
    displayName: "Free",
    price: 0,
    description: "For individuals and small teams",
    limits: {
      members: 3,
      aiCredits: 100,
      notes: 50,
      storageQuotaMB: 100,
    },
    features: ["basic", "notes"],
  },
  pro: {
    displayName: "Pro",
    price: 29,
    description: "For growing teams",
    limits: {
      members: 20,
      aiCredits: 5000,
      notes: -1, // unlimited
      storageQuotaMB: 1000,
    },
    features: ["basic", "notes", "ai", "api", "analytics"],
  },
  enterprise: {
    displayName: "Enterprise",
    price: 99,
    description: "For large organizations",
    limits: {
      members: -1, // unlimited
      aiCredits: -1, // unlimited
      notes: -1, // unlimited
      storageQuotaMB: -1, // unlimited
    },
    features: [
      "basic",
      "notes",
      "ai",
      "api",
      "analytics",
      "custom-roles",
      "sso",
    ],
  },
} as const;

export type PlanTier = keyof typeof PLAN_CONFIG;
export type LimitKey = keyof (typeof PLAN_CONFIG)["free"]["limits"];
export type Feature = (typeof PLAN_CONFIG)[PlanTier]["features"][number];

/**
 * AI credit costs per model. Different models have different costs.
 * -1 means unlimited for enterprise — handled by the entitlement layer.
 */
export const AI_CREDIT_COSTS: Record<string, number> = {
  "gpt-4o": 10,
  "gpt-4o-mini": 2,
  "claude-sonnet-4-5-20250929": 8,
  "claude-haiku-4-5-20251001": 2,
};

/** Default credit cost for unknown models */
export const DEFAULT_CREDIT_COST = 5;

/**
 * Get the effective tier for a team.
 * Teams without a subscriptionTier are on the free tier.
 */
export function getTeamTier(team: {
  subscriptionTier?: string | null;
}): PlanTier {
  const tier = team.subscriptionTier as PlanTier | undefined | null;
  if (tier && tier in PLAN_CONFIG) {
    return tier;
  }
  return "free";
}

/**
 * Get the limit value for a team's tier and limit key.
 * Returns -1 for unlimited.
 */
export function getLimit(tier: PlanTier, key: LimitKey): number {
  return PLAN_CONFIG[tier].limits[key];
}

/**
 * Check if a tier has a specific feature.
 */
export function tierHasFeature(tier: PlanTier, feature: string): boolean {
  return (PLAN_CONFIG[tier].features as readonly string[]).includes(feature);
}

/**
 * Get the credit cost for an AI model.
 */
export function getAICreditCost(model: string): number {
  return AI_CREDIT_COSTS[model] ?? DEFAULT_CREDIT_COST;
}

/**
 * Feature list descriptions for UI display.
 */
export const PLAN_FEATURES_DISPLAY: Record<
  PlanTier,
  { label: string; features: string[] }
> = {
  free: {
    label: "$0/mo",
    features: [
      "Up to 3 team members",
      "100 AI credits/month",
      "50 notes",
      "100 MB storage",
    ],
  },
  pro: {
    label: "$29/mo",
    features: [
      "Up to 20 team members",
      "5,000 AI credits/month",
      "Unlimited notes",
      "1 GB storage",
      "API access",
      "Analytics",
    ],
  },
  enterprise: {
    label: "$99/mo",
    features: [
      "Unlimited team members",
      "Unlimited AI credits",
      "Unlimited notes",
      "Unlimited storage",
      "Custom roles & SSO",
      "Priority support",
    ],
  },
};
