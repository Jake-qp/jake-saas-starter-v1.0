# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-003
**Date:** 2026-02-11

Polar Billing + Credits — Team-level billing via `@convex-dev/polar`, three-tier plan system (Free/Pro/Enterprise), configurable entitlements, credit-based AI billing, webhook integration, billing settings page.

**Files Created:**
- `lib/planConfig.ts` (tier definitions, limits, AI credit costs)
- `convex/entitlements.ts` (checkEntitlement, getCurrentUsage, decrementCredits)
- `convex/billing.ts` (Polar component, queries, mutations)
- `convex/__tests__/billing.test.ts` (29 tests)
- `app/t/[teamSlug]/settings/billing/page.tsx` (billing settings UI)

**Files Modified:**
- `convex/schema.ts` (teams billing fields, aiUsage table)
- `convex/convex.config.ts` (@convex-dev/polar component)
- `convex/http.ts` (Polar webhook routes)
- `convex/cronJobs.ts` (implemented resetMonthlyCredits, syncSubscriptions)
- `app/t/[teamSlug]/settings/SettingsMenu.tsx` (Billing nav link)
- `lib/__tests__/planConfig.test.ts` (27 real tests, replaced 14 todo seeds)
- `package.json` (@convex-dev/polar, @polar-sh/sdk, @polar-sh/checkout)

**Key Implementation:**
- `checkEntitlement()` enforces per-tier limits with ConvexError upgrade prompts
- `decrementCredits()` tracks AI credit consumption per model per team
- Free tier default when no Polar subscription (no Polar required)
- Webhook-driven subscription state sync with idempotent handlers

**Spec:** `docs/specs/F001-003-polar-billing.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Previously Completed
**ID:** F001-014
**Date:** 2026-02-11

Production Infrastructure — Sentry, Vercel Analytics, PostHog proxy, cron jobs, rate limiting.

**Spec:** `docs/specs/F001-014-production-infrastructure.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 172 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 5 complete (F001-001, F001-002, F001-003, F001-014, F001-016) | 12 pending
