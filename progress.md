# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-008
**Date:** 2026-02-11

Feature Flags (PostHog) — 21 new tests (admin schema, hooks, API security, route structure).
PostHog feature flag hooks with graceful degradation, admin management UI at /admin/flags proxying PostHog REST API, isSuperAdmin infrastructure.

**Files Created:**
- `convex/admin.ts` — isSuperAdmin query
- `convex/__tests__/admin.test.ts` — 7 admin schema/function tests
- `lib/featureFlagAdmin.ts` — server-side PostHog API helpers
- `lib/adminAuth.ts` — verifySuperAdmin for API routes
- `lib/__tests__/featureFlags.test.ts` — 7 hook + graceful degradation tests
- `lib/__tests__/adminAuth.test.ts` — 6 API route security tests
- `app/admin/layout.tsx` — admin layout with sidebar
- `app/admin/flags/page.tsx` — flag management UI
- `app/api/admin/flags/route.ts` — GET/POST flag API
- `app/api/admin/flags/[id]/route.ts` — PATCH/DELETE flag API

**Files Modified:**
- `convex/schema.ts` — isSuperAdmin field on users table
- `convex/functions.ts` — adminQuery/adminMutation wrappers
- `lib/hooks/use-feature-flag.ts` — added useFeatureFlagWithPayload

**Key Implementation:**
- isSuperAdmin boolean on users table + adminQuery/adminMutation wrappers
- PostHog API proxied via Next.js API routes (POSTHOG_PERSONAL_API_KEY never sent to client)
- All admin routes verify isSuperAdmin before proxying

**Spec:** `docs/specs/F001-008-feature-flags.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 373 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 13 complete | 4 pending
