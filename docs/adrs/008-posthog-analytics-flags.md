# ADR-008: PostHog for Analytics and Feature Flags
**Status:** Accepted
**Date:** 2026-02-10

## Context
The V2 PRD originally specified two Convex-native modules: F001-008 (Feature Flags) with `featureFlags`/`teamFeatureFlags` tables and reactive resolution, and F001-009 (Analytics) with an `analyticsEvents` table and custom aggregation queries. Building these from scratch requires significant effort for table design, aggregation logic, retention policies, and admin dashboards — and still produces a less capable solution than established platforms.

PostHog is a developer-first product analytics platform with a generous free tier (1M events, 1M feature flag requests, 5K session replays/month, unlimited seats). It provides analytics, feature flags, session replay, A/B testing, and LLM observability out of the box.

## Decision
Replace Convex-native feature flags and analytics with PostHog. Use PostHog for:

- **Product analytics** — event tracking via `posthog.capture()`, funnels, retention, user paths
- **Feature flags** — rollouts, A/B tests, percentage-based rollouts, per-team targeting via groups
- **Session replay** — opt-in for debugging user issues (free tier: 5K/month)

Keep in Convex:
- **Audit logging** — `auditLog` table stays Convex-native (transactional integrity, security concern)
- **Billing/entitlements** — Convex + Polar (transactional, not analytics)
- **Error monitoring** — Sentry (more mature error tracking, separate concern)
- **Web performance** — Vercel Analytics + Speed Insights (Core Web Vitals, complementary)

### Integration Architecture

**Client-side (`posthog-js`):**
- Browser singleton initialized with reverse proxy (`api_host: "/ph"`) to avoid ad-blockers
- Manual pageview capture for App Router (`usePathname()` + `useSearchParams()`)
- `posthog.identify(userId, { email, name })` after auth resolves
- `posthog.group("team", teamId, { name, subscription_tier })` for team-level analytics
- Graceful degradation: returns `null` when `NEXT_PUBLIC_POSTHOG_KEY` is not set

**Server-side (`posthog-node`):**
- Singleton with `flushAt: 1`, `flushInterval: 0` for serverless compatibility
- Used in API routes and server components

**Convex-side (`@samhoque/convex-posthog`):**
- Non-blocking event capture from mutations via `ctx.scheduler.runAfter`
- Tracks server-side events (subscription changes, AI usage, admin actions)

**Wrapper hooks (preserve existing API surface):**
- `useTrack()` wraps `posthog.capture()` — fire-and-forget `(event, properties?) => void`
- `useFeatureFlag(key)` wraps `useFeatureFlagEnabled()` — returns `boolean`, defaults `false`
- `useFeatureFlagWithPayload(key)` for flags with JSON payloads

**Admin flag management:**
- Next.js API routes proxy PostHog's REST API (verified via `isSuperAdmin`)
- `POSTHOG_PERSONAL_API_KEY` stays server-side only
- Admin UI at `/admin/flags` with DataTable + toggle switches

**Reverse proxy (Next.js rewrites):**
- `/ph/static/:path*` -> `https://us-assets.i.posthog.com/static/:path*`
- `/ph/:path*` -> `https://us.i.posthog.com/:path*`

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Vercel + `.env.local` | Client-side project key |
| `POSTHOG_API_KEY` | Vercel + Convex | Server-side project key |
| `POSTHOG_PERSONAL_API_KEY` | Vercel only | Admin flag management API |
| `POSTHOG_PROJECT_ID` | Vercel only | Project ID for management API |
| `POSTHOG_HOST` | Vercel + Convex | Defaults to `https://us.i.posthog.com` |

## Consequences

### Positive
- Eliminates ~500 lines of custom analytics code (tables, aggregation queries, retention cleanup, admin UI)
- Eliminates ~300 lines of custom feature flag code (tables, resolution logic, tier defaults)
- Funnels, retention charts, session replay, and A/B testing available immediately
- PostHog Groups enable team-level analytics (maps to our multi-tenant model)
- LLM observability for AI features (token usage, latency, model comparison)
- `useTrack()` and `useFeatureFlag()` API surface unchanged — existing CLAUDE.md conventions work
- Free tier is generous enough for most SaaS startups (1M events/month)

### Negative
- Feature flags poll every ~30s (not instant like Convex subscriptions). Acceptable for 99% of SaaS use cases (rollouts, tier gating, A/B tests). If a specific flag needs instant propagation, add a single Convex-native flag for that case.
- External dependency for analytics and flags (mitigated by graceful degradation — app works without PostHog)
- Analytics dashboards live in PostHog, not in the custom admin panel (admin panel links to PostHog dashboard instead)
- Removes `featureFlags`, `teamFeatureFlags`, and `analyticsEvents` tables from the Convex schema
- Server-side flag evaluation from Convex requires `@samhoque/convex-posthog` community package

### Schema Changes
- **Remove:** `featureFlags` table, `teamFeatureFlags` table, `analyticsEvents` table
- **Keep:** `auditLog` table (security/compliance concern, stays Convex-native)

### PRD Modules Affected
- **F001-008 (Feature Flags):** PostHog flags replace Convex-native. Admin manages via PostHog API proxy.
- **F001-009 (Analytics):** PostHog replaces `analyticsEvents` table. Dashboards in PostHog.
- **F001-010 (Super Admin):** Admin flags page proxies PostHog API. Analytics links to PostHog.
- **F001-014 (Prod Infra):** PostHog added to monitoring stack alongside Sentry + Vercel Analytics.
