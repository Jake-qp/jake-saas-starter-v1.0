# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-014
**Date:** 2026-02-11

Production Infrastructure — Sentry error monitoring (client/server/edge), Vercel Analytics + Speed Insights, PostHog reverse proxy, 4 cron jobs, team-scoped rate limiting, preview seed data, deployment docs.

**Files Created:**
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- `instrumentation.ts`
- `app/global-error.tsx`
- `convex/convex.config.ts`, `convex/rateLimit.ts`
- `convex/crons.ts`, `convex/cronJobs.ts`
- `convex/seedPreview.ts`
- `docs/deployment.md`

**Files Modified:**
- `app/layout.tsx` (Analytics + SpeedInsights)
- `next.config.js` (Sentry + PostHog proxy)
- `middleware.ts` (exclude /monitoring)
- `convex/users/teams/members/invites.tsx` (rate limiting)
- `package.json` (@sentry/nextjs, @vercel/analytics, @vercel/speed-insights, @convex-dev/rate-limiter)

**Spec:** `docs/specs/F001-014-production-infrastructure.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Previously Completed
**ID:** F001-001
**Date:** 2026-02-11

Convex Auth Migration + Magic Link

**Spec:** `docs/specs/F001-001-convex-auth.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 116 passing (20 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 4 complete (F001-001, F001-002, F001-014, F001-016) | 13 pending
