/**
 * Onboarding System Configuration (F001-007)
 *
 * Single source of truth for onboarding wizard steps,
 * status values, and validation helpers.
 */

export interface OnboardingStep {
  id: string;
  label: string;
  description: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Set up your profile",
  },
  {
    id: "team",
    label: "Team",
    description: "Name your workspace",
  },
  {
    id: "complete",
    label: "Get Started",
    description: "You're all set!",
  },
];

export type OnboardingStatus = "in_progress" | "completed" | "skipped";

const VALID_STATUSES: Set<string> = new Set([
  "in_progress",
  "completed",
  "skipped",
]);

export function isValidOnboardingStatus(status: string): boolean {
  return VALID_STATUSES.has(status);
}

export function needsOnboarding(status: string | undefined): boolean {
  return status === undefined || status === "in_progress";
}

export function isValidStep(step: number): boolean {
  return Number.isInteger(step) && step >= 0 && step < ONBOARDING_STEPS.length;
}

export function getTotalSteps(): number {
  return ONBOARDING_STEPS.length;
}
