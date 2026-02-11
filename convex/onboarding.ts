import { v } from "convex/values";
import { mutation, query } from "./functions";

/**
 * Onboarding System (F001-007)
 *
 * Queries and mutations for tracking onboarding wizard progress.
 * Status is stored on the users table: onboardingStatus + onboardingStep.
 */

// Get the current user's onboarding status
export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return null;
    return {
      onboardingStatus: ctx.viewer.onboardingStatus,
      onboardingStep: ctx.viewer.onboardingStep ?? 0,
    };
  },
});

// Update onboarding step progress
export const updateStep = mutation({
  args: {
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = ctx.viewerX();
    await viewer.patch({
      onboardingStep: args.step,
      onboardingStatus: "in_progress",
    });
  },
});

// Complete onboarding
export const complete = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = ctx.viewerX();
    await viewer.patch({
      onboardingStatus: "completed",
    });
  },
});

// Skip onboarding
export const skip = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = ctx.viewerX();
    await viewer.patch({
      onboardingStatus: "skipped",
    });
  },
});
