# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-009
**Date:** 2026-02-11

Analytics & Event Tracking (PostHog) — PostHog product analytics with env-var gated graceful degradation, useTrack() hook, PostHogProvider/PostHogPageView in root layout, user identify + team group, Convex-side tracking via @samhoque/convex-posthog.

**Files Created:**
- `lib/posthog/client.ts` (browser singleton with /ph reverse proxy)
- `lib/posthog/server.ts` (server singleton for API routes)
- `lib/posthog/PostHogProvider.tsx` (client initialization component)
- `lib/posthog/PostHogPageView.tsx` (App Router manual pageview capture)
- `lib/posthog/PostHogIdentify.tsx` (user identify + team group)
- `lib/hooks/use-track.ts` (useTrack hook wrapping posthog.capture)
- `lib/hooks/use-feature-flag.ts` (useFeatureFlag hook)
- `convex/posthog.ts` (@samhoque/convex-posthog instance)
- `lib/__tests__/posthog.test.ts` (19 tests)

**Files Modified:**
- `convex/convex.config.ts` (added posthog component)
- `app/layout.tsx` (PostHogProvider + PostHogPageView)
- `package.json` (posthog-js, posthog-node, @samhoque/convex-posthog)

**Key Implementation:**
- All hooks return no-ops when NEXT_PUBLIC_POSTHOG_KEY is unset
- PostHog client uses /ph reverse proxy to avoid ad-blockers
- PostHogIdentify calls posthog.identify() + posthog.group("team", teamId)
- PostHogPageView captures $pageview on pathname/searchParams changes

**Spec:** `docs/specs/F001-009-analytics-posthog.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 191 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 6 complete (F001-001, F001-002, F001-003, F001-009, F001-014, F001-016) | 11 pending
