import { describe, it, expect } from "vitest";
import {
  PLAN_CONFIG,
  AI_CREDIT_COSTS,
  DEFAULT_CREDIT_COST,
  getTeamTier,
  getLimit,
  tierHasFeature,
  getAICreditCost,
  PLAN_FEATURES_DISPLAY,
} from "../planConfig";
import type { PlanTier } from "../planConfig";

describe("planConfig", () => {
  describe("structure validation", () => {
    it("should export a PLAN_CONFIG object with free, pro, and enterprise tiers", () => {
      expect(PLAN_CONFIG).toHaveProperty("free");
      expect(PLAN_CONFIG).toHaveProperty("pro");
      expect(PLAN_CONFIG).toHaveProperty("enterprise");
    });

    it("should have required fields on each tier: name, price, limits", () => {
      const tiers: PlanTier[] = ["free", "pro", "enterprise"];
      for (const tier of tiers) {
        expect(PLAN_CONFIG[tier]).toHaveProperty("displayName");
        expect(PLAN_CONFIG[tier]).toHaveProperty("price");
        expect(PLAN_CONFIG[tier]).toHaveProperty("limits");
        expect(PLAN_CONFIG[tier]).toHaveProperty("features");
      }
    });

    it("should have aiCredits limit on each tier", () => {
      const tiers: PlanTier[] = ["free", "pro", "enterprise"];
      for (const tier of tiers) {
        expect(PLAN_CONFIG[tier].limits).toHaveProperty("aiCredits");
        expect(typeof PLAN_CONFIG[tier].limits.aiCredits).toBe("number");
      }
    });

    it("should have members limit on each tier", () => {
      const tiers: PlanTier[] = ["free", "pro", "enterprise"];
      for (const tier of tiers) {
        expect(PLAN_CONFIG[tier].limits).toHaveProperty("members");
        expect(typeof PLAN_CONFIG[tier].limits.members).toBe("number");
      }
    });

    it("should have free tier with $0 price", () => {
      expect(PLAN_CONFIG.free.price).toBe(0);
    });

    it("should have pro tier with a positive price", () => {
      expect(PLAN_CONFIG.pro.price).toBeGreaterThan(0);
    });

    it("should have enterprise tier with highest limits", () => {
      expect(PLAN_CONFIG.enterprise.limits.members).toBe(-1);
      expect(PLAN_CONFIG.enterprise.limits.aiCredits).toBe(-1);
      expect(PLAN_CONFIG.enterprise.limits.notes).toBe(-1);
    });
  });

  describe("limit values", () => {
    it("free tier aiCredits should be less than pro tier", () => {
      expect(PLAN_CONFIG.free.limits.aiCredits).toBeLessThan(
        PLAN_CONFIG.pro.limits.aiCredits,
      );
    });

    it("pro tier aiCredits should be less than enterprise tier (unlimited)", () => {
      expect(PLAN_CONFIG.pro.limits.aiCredits).toBeGreaterThan(0);
      expect(PLAN_CONFIG.enterprise.limits.aiCredits).toBe(-1);
    });

    it("free tier members should be less than or equal to pro tier", () => {
      expect(PLAN_CONFIG.free.limits.members).toBeLessThanOrEqual(
        PLAN_CONFIG.pro.limits.members,
      );
    });

    it("enterprise tier should have unlimited or very high limits", () => {
      const limits = PLAN_CONFIG.enterprise.limits;
      for (const value of Object.values(limits)) {
        expect(value).toBe(-1);
      }
    });
  });

  describe("credit costs", () => {
    it("should define credit costs per AI model", () => {
      expect(Object.keys(AI_CREDIT_COSTS).length).toBeGreaterThan(0);
    });

    it("GPT-4 should cost more credits than GPT-4o-mini/Haiku", () => {
      expect(AI_CREDIT_COSTS["gpt-4o"]).toBeGreaterThan(
        AI_CREDIT_COSTS["gpt-4o-mini"],
      );
      expect(AI_CREDIT_COSTS["gpt-4o"]).toBeGreaterThan(
        AI_CREDIT_COSTS["claude-haiku-4-5-20251001"],
      );
    });

    it("all defined models should have positive credit costs", () => {
      for (const [model, cost] of Object.entries(AI_CREDIT_COSTS)) {
        expect(cost, `${model} should have positive cost`).toBeGreaterThan(0);
      }
    });

    it("should have a default credit cost for unknown models", () => {
      expect(DEFAULT_CREDIT_COST).toBeGreaterThan(0);
    });
  });

  describe("getTeamTier", () => {
    it("returns free for teams with no subscriptionTier", () => {
      expect(getTeamTier({})).toBe("free");
      expect(getTeamTier({ subscriptionTier: undefined })).toBe("free");
      expect(getTeamTier({ subscriptionTier: null })).toBe("free");
    });

    it("returns the correct tier when set", () => {
      expect(getTeamTier({ subscriptionTier: "free" })).toBe("free");
      expect(getTeamTier({ subscriptionTier: "pro" })).toBe("pro");
      expect(getTeamTier({ subscriptionTier: "enterprise" })).toBe(
        "enterprise",
      );
    });

    it("returns free for invalid tier values", () => {
      expect(getTeamTier({ subscriptionTier: "invalid" })).toBe("free");
      expect(getTeamTier({ subscriptionTier: "" })).toBe("free");
    });
  });

  describe("getLimit", () => {
    it("returns correct limits for free tier", () => {
      expect(getLimit("free", "members")).toBe(3);
      expect(getLimit("free", "aiCredits")).toBe(100);
      expect(getLimit("free", "notes")).toBe(50);
    });

    it("returns -1 for unlimited limits", () => {
      expect(getLimit("enterprise", "members")).toBe(-1);
      expect(getLimit("enterprise", "aiCredits")).toBe(-1);
      expect(getLimit("pro", "notes")).toBe(-1);
    });
  });

  describe("tierHasFeature", () => {
    it("all tiers have basic and notes features", () => {
      const tiers: PlanTier[] = ["free", "pro", "enterprise"];
      for (const tier of tiers) {
        expect(tierHasFeature(tier, "basic")).toBe(true);
        expect(tierHasFeature(tier, "notes")).toBe(true);
      }
    });

    it("free tier does not have ai or api features", () => {
      expect(tierHasFeature("free", "ai")).toBe(false);
      expect(tierHasFeature("free", "api")).toBe(false);
    });

    it("pro tier has ai and api features", () => {
      expect(tierHasFeature("pro", "ai")).toBe(true);
      expect(tierHasFeature("pro", "api")).toBe(true);
    });

    it("enterprise tier has custom-roles and sso", () => {
      expect(tierHasFeature("enterprise", "custom-roles")).toBe(true);
      expect(tierHasFeature("enterprise", "sso")).toBe(true);
    });
  });

  describe("getAICreditCost", () => {
    it("returns correct cost for known models", () => {
      expect(getAICreditCost("gpt-4o")).toBe(10);
      expect(getAICreditCost("gpt-4o-mini")).toBe(2);
      expect(getAICreditCost("claude-sonnet-4-5-20250929")).toBe(8);
      expect(getAICreditCost("claude-haiku-4-5-20251001")).toBe(2);
    });

    it("returns default cost for unknown models", () => {
      expect(getAICreditCost("unknown-model")).toBe(DEFAULT_CREDIT_COST);
    });
  });

  describe("PLAN_FEATURES_DISPLAY", () => {
    it("has display info for all tiers", () => {
      const tiers: PlanTier[] = ["free", "pro", "enterprise"];
      for (const tier of tiers) {
        expect(PLAN_FEATURES_DISPLAY[tier]).toHaveProperty("label");
        expect(PLAN_FEATURES_DISPLAY[tier]).toHaveProperty("features");
        expect(PLAN_FEATURES_DISPLAY[tier].features.length).toBeGreaterThan(0);
      }
    });
  });
});
