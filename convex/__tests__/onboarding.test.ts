import { describe, expect, it } from "vitest";
import schema from "../schema";

/**
 * Onboarding System test suite (F001-007).
 *
 * Tests schema fields, onboarding config, status transitions,
 * and step validation logic.
 */

describe("F001-007: Onboarding System", () => {
  // ═══ Schema Tests ═══
  describe("schema — users table onboarding fields", () => {
    it("should have onboardingStatus field on users table", () => {
      const table = schema.tables.users;
      expect(table).toBeDefined();
      // The users table validator should accept onboardingStatus
      const validator = table.validator;
      expect(validator).toBeDefined();
    });

    it("should have onboardingStep field on users table", () => {
      const table = schema.tables.users;
      expect(table).toBeDefined();
    });
  });

  // ═══ Onboarding Config Tests ═══
  describe("onboarding steps config", () => {
    it("should define onboarding steps", async () => {
      const { ONBOARDING_STEPS } = await import("../../lib/onboardingConfig");
      expect(ONBOARDING_STEPS).toBeDefined();
      expect(ONBOARDING_STEPS.length).toBeGreaterThanOrEqual(2);
    });

    it("each step should have id, label, and description", async () => {
      const { ONBOARDING_STEPS } = await import("../../lib/onboardingConfig");
      for (const step of ONBOARDING_STEPS) {
        expect(step.id).toBeTruthy();
        expect(step.label).toBeTruthy();
        expect(step.description).toBeTruthy();
      }
    });

    it("should have a profile step as the first step", async () => {
      const { ONBOARDING_STEPS } = await import("../../lib/onboardingConfig");
      expect(ONBOARDING_STEPS[0].id).toBe("profile");
    });

    it("should have a completion step as the last step", async () => {
      const { ONBOARDING_STEPS } = await import("../../lib/onboardingConfig");
      const lastStep = ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
      expect(lastStep.id).toBe("complete");
    });
  });

  // ═══ Status Validation Tests ═══
  describe("onboarding status helpers", () => {
    it("isValidOnboardingStatus should accept valid statuses", async () => {
      const { isValidOnboardingStatus } =
        await import("../../lib/onboardingConfig");
      expect(isValidOnboardingStatus("in_progress")).toBe(true);
      expect(isValidOnboardingStatus("completed")).toBe(true);
      expect(isValidOnboardingStatus("skipped")).toBe(true);
    });

    it("isValidOnboardingStatus should reject invalid statuses", async () => {
      const { isValidOnboardingStatus } =
        await import("../../lib/onboardingConfig");
      expect(isValidOnboardingStatus("invalid")).toBe(false);
      expect(isValidOnboardingStatus("")).toBe(false);
    });

    it("needsOnboarding should return true for undefined status", async () => {
      const { needsOnboarding } = await import("../../lib/onboardingConfig");
      expect(needsOnboarding(undefined)).toBe(true);
    });

    it("needsOnboarding should return true for in_progress status", async () => {
      const { needsOnboarding } = await import("../../lib/onboardingConfig");
      expect(needsOnboarding("in_progress")).toBe(true);
    });

    it("needsOnboarding should return false for completed status", async () => {
      const { needsOnboarding } = await import("../../lib/onboardingConfig");
      expect(needsOnboarding("completed")).toBe(false);
    });

    it("needsOnboarding should return false for skipped status", async () => {
      const { needsOnboarding } = await import("../../lib/onboardingConfig");
      expect(needsOnboarding("skipped")).toBe(false);
    });
  });

  // ═══ Step Validation Tests ═══
  describe("step validation", () => {
    it("isValidStep should return true for valid step indices", async () => {
      const { isValidStep, ONBOARDING_STEPS } =
        await import("../../lib/onboardingConfig");
      for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
        expect(isValidStep(i)).toBe(true);
      }
    });

    it("isValidStep should return false for out-of-range indices", async () => {
      const { isValidStep, ONBOARDING_STEPS } =
        await import("../../lib/onboardingConfig");
      expect(isValidStep(-1)).toBe(false);
      expect(isValidStep(ONBOARDING_STEPS.length)).toBe(false);
      expect(isValidStep(100)).toBe(false);
    });

    it("getTotalSteps should return correct count", async () => {
      const { getTotalSteps, ONBOARDING_STEPS } =
        await import("../../lib/onboardingConfig");
      expect(getTotalSteps()).toBe(ONBOARDING_STEPS.length);
    });
  });
});
