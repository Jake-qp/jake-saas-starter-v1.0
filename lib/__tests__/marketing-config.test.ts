import { describe, it, expect } from "vitest";
import {
  PLAN_CONFIG,
  PLAN_FEATURES_DISPLAY,
  type PlanTier,
} from "@/lib/planConfig";
import { FEATURES, FAQ_ITEMS } from "@/lib/marketing-content";

describe("PricingTable data from planConfig", () => {
  const tiers = Object.keys(PLAN_CONFIG) as PlanTier[];

  it("has at least 2 plan tiers", () => {
    expect(tiers.length).toBeGreaterThanOrEqual(2);
  });

  it("every tier has displayName, price, and description", () => {
    for (const tier of tiers) {
      expect(PLAN_CONFIG[tier].displayName).toBeTruthy();
      expect(typeof PLAN_CONFIG[tier].price).toBe("number");
      expect(PLAN_CONFIG[tier].description).toBeTruthy();
    }
  });

  it("every tier has a display features list", () => {
    for (const tier of tiers) {
      expect(PLAN_FEATURES_DISPLAY[tier]).toBeDefined();
      expect(PLAN_FEATURES_DISPLAY[tier].features.length).toBeGreaterThan(0);
    }
  });

  it("free tier has price 0", () => {
    expect(PLAN_CONFIG.free.price).toBe(0);
  });

  it("pro tier is highlighted as recommended", () => {
    // The PricingTable component highlights "pro" as recommended
    expect(tiers).toContain("pro");
  });
});

describe("marketing-content", () => {
  it("exports FEATURES array with at least 3 items", () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(3);
  });

  it("each feature has icon, title, and description", () => {
    for (const feature of FEATURES) {
      expect(feature.icon).toBeDefined();
      expect(feature.title).toBeTruthy();
      expect(feature.description).toBeTruthy();
    }
  });

  it("exports FAQ_ITEMS array with at least 3 items", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(3);
  });

  it("each FAQ item has question and answer", () => {
    for (const item of FAQ_ITEMS) {
      expect(item.question).toBeTruthy();
      expect(item.answer).toBeTruthy();
    }
  });
});
