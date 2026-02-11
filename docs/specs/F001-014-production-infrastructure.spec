# Feature: Production Infrastructure (F001-014)

## User Context
- **Primary User:** Developer deploying this SaaS boilerplate to production
- **Context:** Setting up monitoring, analytics, seed data, and background jobs for a Vercel + Convex deployment
- **Top Goals:**
  1. Error monitoring with Sentry (client/server/edge) that gracefully degrades when unconfigured
  2. Analytics and performance monitoring via Vercel Analytics + Speed Insights + PostHog reverse proxy
  3. Background job infrastructure (crons) and rate limiting for abuse prevention
- **Mental Model:** Production infra = things that run silently in the background, only surfacing when errors occur or dashboards are checked

## Feature Outline (Approved — from PRD)

### Components
1. **Sentry Integration** — Client, server, edge error capture with tunnel route
2. **Vercel Analytics + Speed Insights** — Two components in root layout
3. **PostHog Reverse Proxy** — next.config.js rewrites for ad-blocker avoidance
4. **Cron Jobs** — 4 recurring Convex jobs (invite cleanup, credit reset, subscription sync, session cleanup)
5. **Rate Limiter** — @convex-dev/rate-limiter with team-scoped token bucket + fixed window
6. **Preview Seed Data** — convex/seedPreview.ts for demo environments
7. **Deployment Documentation** — docs/deployment.md

### Out of Scope
- PostHog client/server init, identify/group, hooks (F001-008/F001-009)
- Sentry performance/profiling configuration
- Custom error boundary UI
- Alerting/PagerDuty integration

## User Story
As a developer deploying the SaaS boilerplate
I want production-grade monitoring, analytics, background jobs, and rate limiting pre-configured
So that the app is observable, resilient, and ready for production traffic from day one

## Acceptance Criteria
- [x] AC1: Sentry captures client-side and server-side errors when `NEXT_PUBLIC_SENTRY_DSN` is set
- [x] AC2: App runs without errors when Sentry env vars are not set (graceful degradation)
- [x] AC3: Sentry tunnel route (`/monitoring`) forwards events to avoid ad-blockers
- [x] AC4: `@vercel/analytics` tracks page views in Vercel dashboard
- [x] AC5: `@vercel/speed-insights` reports Core Web Vitals (LCP, FID, CLS, TTFB, INP)
- [x] AC6: PostHog reverse proxy configured in `next.config.js` (`/ph/*` rewrites)
- [x] AC7: PostHog gracefully disabled when `NEXT_PUBLIC_POSTHOG_KEY` is not set
- [x] AC8: `convex/seedPreview.ts` populates demo data (team, users, notes, sample content)
- [x] AC9: `docs/deployment.md` covers Vercel setup, env vars (including PostHog), preview deploys, custom domains
- [x] AC10: `convex/crons.ts` exists with 4+ recurring jobs (invite cleanup, credit reset, subscription sync, session cleanup)
- [x] AC11: Cron jobs appear in Convex dashboard and execute on schedule
- [x] AC12: `@convex-dev/rate-limiter` is installed and configured for team-scoped rate limiting
- [x] AC13: Rate limiter used in invite sending and AI request mutations

## Edge Cases
- Missing Sentry DSN: App loads normally, no errors in console
- Missing PostHog key: No PostHog requests made, hooks return false/no-op
- Empty database: seedPreview creates complete demo dataset from scratch
- Rate limit exceeded: Returns clear error message, does not crash

## Success Definition
We'll know this works when: the app boots cleanly with zero env vars set for optional services, and when configured, Sentry captures errors, Vercel Analytics reports page views, cron jobs run on schedule, and rate limiting prevents abuse.
