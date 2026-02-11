# Feature: Analytics & Event Tracking (PostHog) — F001-009

## PRD Anchor (Source of Truth)
**Feature:** F001-009
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-009 -->/,/<!-- END_FEATURE: F001-009 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

## User Context
- **Primary User:** SaaS app developer using this boilerplate
- **Context:** Needs product analytics out-of-the-box, without writing custom event infrastructure
- **Top Goals:**
  1. Track user actions and pageviews with minimal setup
  2. Link events to authenticated users and teams
  3. App must work perfectly when PostHog is not configured
- **Mental Model:** Drop-in analytics provider — configure env var, get events in PostHog dashboard

## Feature Outline

### Type: Backend-Only (Infrastructure)
No new UI pages. Delivers:
- PostHog client singleton with reverse proxy
- PostHog server singleton for API routes
- PostHogProvider + PostHogPageView components
- useTrack() hook wrapping posthog.capture()
- User identify + team group integration
- Convex-side event tracking via @samhoque/convex-posthog

### Key User Flows
1. **Developer enables PostHog:** Sets `NEXT_PUBLIC_POSTHOG_KEY` env var → PostHog client initializes → events flow to `/ph/` proxy → PostHog dashboard shows data
2. **User browses app:** PostHogPageView captures route changes via App Router → pageviews appear in PostHog
3. **User authenticates:** posthog.identify() links anonymous events to userId → posthog.group("team", teamId) enables team analytics
4. **Developer tracks custom event:** Calls useTrack()("event_name", { properties }) → event captured in PostHog
5. **PostHog not configured:** No env var → all hooks return no-ops → zero errors

### Out of Scope
- Feature flags (F001-008)
- Admin flag management UI (F001-010)
- Session replay configuration
- A/B testing setup
- Custom PostHog dashboards

## User Story
As a SaaS developer
I want PostHog analytics integrated with env-var gating
So that I can track user behavior without building custom analytics infrastructure

## Acceptance Criteria
- [x] AC1: `useTrack(event, properties?)` fires events that appear in PostHog dashboard
- [x] AC2: `useTrack()` is a no-op when PostHog is not configured
- [x] AC3: PostHog reverse proxy works: network tab shows requests to `/ph/` not `us.i.posthog.com`
- [x] AC4: `posthog.identify()` links events to authenticated users after auth resolves
- [x] AC5: `posthog.group("team", teamId)` enables team-level analytics
- [x] AC6: Manual pageview capture works with App Router navigation
- [x] AC7: App works without errors when `NEXT_PUBLIC_POSTHOG_KEY` is not set

## Implementation Notes (from PRD)
- PostHog client/server setup with env-var gating + reverse proxy
- `useTrack()` hook wrapping `posthog.capture()`
- `PostHogProvider`, `PostHogPageView`, identify/group integration
- Server-side tracking from Convex via `@samhoque/convex-posthog`

## Architecture Reference
- ADR-008: `docs/adrs/008-posthog-analytics-flags.md`
- Reverse proxy already configured in `next.config.js` (F001-014)
- Env vars documented in CLAUDE.md and deployment.md

## Dependencies
- F001-001 (Convex Auth): Complete — needed for identify/group

## Edge Cases
- PostHog env var missing: All hooks become no-ops, no errors
- PostHog env var set but invalid key: PostHog SDK handles gracefully, no app crashes
- SSR environment: posthog-js only initializes in browser (typeof window check)
- Multiple rapid route changes: PostHogPageView debounces via useEffect cleanup

## Success Definition
We'll know this works when: useTrack() fires events to PostHog via /ph/ proxy when configured, and the entire app works without errors when NEXT_PUBLIC_POSTHOG_KEY is unset.
