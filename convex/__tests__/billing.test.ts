import { describe, expect, it } from "vitest";
import schema from "../schema";
import {
  PLAN_CONFIG,
  getTeamTier,
  getLimit,
  getAICreditCost,
  DEFAULT_CREDIT_COST,
  tierHasFeature,
} from "../../lib/planConfig";
import type { PlanTier, LimitKey } from "../../lib/planConfig";

/**
 * Billing tests (F001-003).
 *
 * Tests schema changes, entitlement logic, and plan configuration
 * for the Polar Billing + Credits system.
 */

describe("billing schema (F001-003)", () => {
  describe("teams table billing fields", () => {
    it("should define the teams table", () => {
      expect(schema.tables.teams).toBeDefined();
    });

    it("should have polarCustomerId index on teams", () => {
      const teamsTable = schema.tables.teams;
      const indexNames = teamsTable.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("polarCustomerId");
    });
  });

  describe("aiUsage table", () => {
    it("should define the aiUsage table", () => {
      expect(schema.tables.aiUsage).toBeDefined();
    });

    it("should have teamTimestamp index on aiUsage", () => {
      const aiUsageTable = schema.tables.aiUsage;
      const indexNames = aiUsageTable.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("teamTimestamp");
    });
  });
});

describe("entitlement logic (F001-003)", () => {
  describe("checkEntitlement — tier limit enforcement", () => {
    it("free tier should limit members to 3", () => {
      const limit = getLimit("free", "members");
      expect(limit).toBe(3);
    });

    it("free tier should limit AI credits to 100", () => {
      const limit = getLimit("free", "aiCredits");
      expect(limit).toBe(100);
    });

    it("pro tier should limit members to 20", () => {
      const limit = getLimit("pro", "members");
      expect(limit).toBe(20);
    });

    it("pro tier should limit AI credits to 5000", () => {
      const limit = getLimit("pro", "aiCredits");
      expect(limit).toBe(5000);
    });

    it("enterprise tier should have unlimited members (-1)", () => {
      const limit = getLimit("enterprise", "members");
      expect(limit).toBe(-1);
    });

    it("enterprise tier should have unlimited AI credits (-1)", () => {
      const limit = getLimit("enterprise", "aiCredits");
      expect(limit).toBe(-1);
    });
  });

  describe("getTeamTier — free tier default", () => {
    it("should default to free when no subscription", () => {
      expect(getTeamTier({})).toBe("free");
    });

    it("should default to free when subscriptionTier is undefined", () => {
      expect(getTeamTier({ subscriptionTier: undefined })).toBe("free");
    });

    it("should default to free when subscriptionTier is null", () => {
      expect(getTeamTier({ subscriptionTier: null })).toBe("free");
    });

    it("should return pro when subscriptionTier is pro", () => {
      expect(getTeamTier({ subscriptionTier: "pro" })).toBe("pro");
    });

    it("should return enterprise when subscriptionTier is enterprise", () => {
      expect(getTeamTier({ subscriptionTier: "enterprise" })).toBe(
        "enterprise",
      );
    });

    it("should default to free for invalid tier", () => {
      expect(getTeamTier({ subscriptionTier: "gold" })).toBe("free");
    });
  });

  describe("credit costs — model pricing", () => {
    it("GPT-4o costs 10 credits", () => {
      expect(getAICreditCost("gpt-4o")).toBe(10);
    });

    it("GPT-4o-mini costs 2 credits", () => {
      expect(getAICreditCost("gpt-4o-mini")).toBe(2);
    });

    it("Claude Sonnet costs 8 credits", () => {
      expect(getAICreditCost("claude-sonnet-4-5-20250929")).toBe(8);
    });

    it("Claude Haiku costs 2 credits", () => {
      expect(getAICreditCost("claude-haiku-4-5-20251001")).toBe(2);
    });

    it("unknown model uses default cost", () => {
      expect(getAICreditCost("unknown-model-v1")).toBe(DEFAULT_CREDIT_COST);
      expect(DEFAULT_CREDIT_COST).toBe(5);
    });
  });

  describe("feature gates — tier-based features", () => {
    it("free tier has basic and notes", () => {
      expect(tierHasFeature("free", "basic")).toBe(true);
      expect(tierHasFeature("free", "notes")).toBe(true);
    });

    it("free tier lacks ai, api, analytics", () => {
      expect(tierHasFeature("free", "ai")).toBe(false);
      expect(tierHasFeature("free", "api")).toBe(false);
      expect(tierHasFeature("free", "analytics")).toBe(false);
    });

    it("pro tier adds ai, api, analytics", () => {
      expect(tierHasFeature("pro", "ai")).toBe(true);
      expect(tierHasFeature("pro", "api")).toBe(true);
      expect(tierHasFeature("pro", "analytics")).toBe(true);
    });

    it("pro tier lacks custom-roles and sso", () => {
      expect(tierHasFeature("pro", "custom-roles")).toBe(false);
      expect(tierHasFeature("pro", "sso")).toBe(false);
    });

    it("enterprise tier has all features", () => {
      expect(tierHasFeature("enterprise", "basic")).toBe(true);
      expect(tierHasFeature("enterprise", "notes")).toBe(true);
      expect(tierHasFeature("enterprise", "ai")).toBe(true);
      expect(tierHasFeature("enterprise", "api")).toBe(true);
      expect(tierHasFeature("enterprise", "analytics")).toBe(true);
      expect(tierHasFeature("enterprise", "custom-roles")).toBe(true);
      expect(tierHasFeature("enterprise", "sso")).toBe(true);
    });
  });

  describe("limit escalation across tiers", () => {
    const limitKeys: LimitKey[] = [
      "members",
      "aiCredits",
      "notes",
      "storageQuotaMB",
    ];
    const tiers: PlanTier[] = ["free", "pro", "enterprise"];

    it("every limit key should be defined for every tier", () => {
      for (const tier of tiers) {
        for (const key of limitKeys) {
          const limit = PLAN_CONFIG[tier].limits[key];
          expect(typeof limit).toBe("number");
        }
      }
    });

    it("free limits should be strictly less than pro limits (where both are finite)", () => {
      for (const key of limitKeys) {
        const freeLimit = PLAN_CONFIG.free.limits[key];
        const proLimit = PLAN_CONFIG.pro.limits[key];
        if (freeLimit !== -1 && proLimit !== -1) {
          expect(freeLimit).toBeLessThan(proLimit);
        }
      }
    });

    it("pro limits should be finite or less than enterprise (unlimited)", () => {
      for (const key of limitKeys) {
        const proLimit = PLAN_CONFIG.pro.limits[key];
        const entLimit = PLAN_CONFIG.enterprise.limits[key];
        // Enterprise should always be unlimited
        expect(entLimit).toBe(-1);
        // Pro should be a positive number or -1
        expect(proLimit === -1 || proLimit > 0).toBe(true);
      }
    });
  });
});
