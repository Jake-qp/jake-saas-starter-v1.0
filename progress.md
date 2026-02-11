# Build Progress

## Current Feature
None — ready for next feature

---

## Last Completed
**ID:** F001-007
**Date:** 2026-02-11

Onboarding System — 15 new tests (schema, config, status helpers, step validation).
Multi-step wizard (Profile, Team, Get Started) using existing StepWizard component.
Progress tracked in DB (onboardingStatus + onboardingStep on users table).
Dashboard auto-redirects new users; skip button on every step.

**Files Created:**
- `convex/onboarding.ts` — getStatus, updateStep, complete, skip
- `convex/__tests__/onboarding.test.ts` — 15 tests
- `lib/onboardingConfig.ts` — steps, status helpers, validation
- `app/t/[teamSlug]/onboarding/page.tsx` — wizard UI

**Files Modified:**
- `convex/schema.ts` — onboardingStatus + onboardingStep fields
- `convex/users.ts` — expose onboardingStatus in viewer query
- `convex/users/teams.ts` — added teams.update mutation
- `app/t/[teamSlug]/page.tsx` — onboarding redirect

**Spec:** `docs/specs/F001-007-onboarding-system.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 352 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 12 complete | 5 pending
