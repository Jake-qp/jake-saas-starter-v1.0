# Deployment Guide

## Overview

This SaaS boilerplate deploys to **Vercel** (frontend + API routes) with **Convex** (backend + realtime database). Both platforms support automatic deployments from GitHub.

## Prerequisites

- GitHub repository connected to Vercel
- Convex project created at [dashboard.convex.dev](https://dashboard.convex.dev)
- (Optional) Sentry project for error monitoring
- (Optional) PostHog project for analytics
- (Optional) Resend account for transactional email

## Vercel Setup

### 1. Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npx convex deploy --cmd 'npm run build'`
5. Output directory: `.next` (default)

### 2. Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `CONVEX_DEPLOY_KEY` | Yes | Convex deployment key (from Convex dashboard → Settings → Deploy Keys) |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL (auto-set by `convex deploy`) |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error monitoring |
| `SENTRY_AUTH_TOKEN` | No | Sentry auth token for source map uploads |
| `SENTRY_ORG` | No | Sentry organization slug |
| `SENTRY_PROJECT` | No | Sentry project slug |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key |

### 3. Environment Variables (Convex Dashboard)

Set these in the Convex dashboard under **Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `SITE_URL` | Yes | Your production URL (e.g., `https://app.example.com`) |
| `CONVEX_AUTH_PRIVATE_KEY` | Yes | Generated via `npx @convex-dev/auth` |
| `RESEND_API_KEY` | No | Resend API key for email (invites, magic links) |
| `HOSTED_URL` | No | Same as SITE_URL — used for invite email links |
| `POLAR_ACCESS_TOKEN` | No | Polar billing API token (F001-003) |
| `POLAR_WEBHOOK_SECRET` | No | Polar webhook verification secret |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features (F001-005) |
| `ANTHROPIC_API_KEY` | No | Anthropic API key for AI features (F001-005) |
| `POSTHOG_API_KEY` | No | PostHog API key (server-side) |
| `POSTHOG_HOST` | No | PostHog host URL (defaults to `https://us.i.posthog.com`) |

## PostHog Integration

### Reverse Proxy

The app includes a PostHog reverse proxy configured in `next.config.js` to avoid ad-blockers:

- `/ph/static/*` → `https://us-assets.i.posthog.com/static/*`
- `/ph/*` → `https://us.i.posthog.com/*`

When configuring the PostHog client (F001-009), point it to `/ph` instead of the PostHog domain.

### Graceful Degradation

If `NEXT_PUBLIC_POSTHOG_KEY` is not set, the PostHog client will not initialize. The reverse proxy rewrites are always present but harmless when PostHog is unconfigured.

## Sentry Integration

### How It Works

- **Client errors**: Captured via `sentry.client.config.ts` (webpack-injected)
- **Server errors**: Captured via `sentry.server.config.ts` (loaded in `instrumentation.ts`)
- **Edge errors**: Captured via `sentry.edge.config.ts` (loaded in `instrumentation.ts`)
- **Tunnel route**: `/monitoring` forwards Sentry events to avoid ad-blockers

### Graceful Degradation

If `NEXT_PUBLIC_SENTRY_DSN` is not set:
- Sentry SDK is disabled at runtime (`enabled: false`)
- `withSentryConfig` is not applied to `next.config.js`
- No source map uploads are attempted
- App runs normally with zero Sentry overhead

## Vercel Analytics & Speed Insights

Always active in the root layout (`app/layout.tsx`):
- `<Analytics />` from `@vercel/analytics/react` — page view tracking
- `<SpeedInsights />` from `@vercel/speed-insights/next` — Core Web Vitals (LCP, FID, CLS, TTFB, INP)

No configuration needed — these work automatically on Vercel.

## Preview Deployments

### Automatic Previews

Vercel creates preview deployments for every pull request. Each preview gets:
- A unique URL (e.g., `my-app-git-feature-xyz.vercel.app`)
- Its own environment (can use separate Convex preview deployment)

### Preview Seed Data

To populate a preview deployment with demo data:

```bash
npx convex run seedPreview:seedPreview
```

This creates:
- 1 demo team (Acme Corp)
- 3 demo users (Alice, Bob, Carol)
- 5 sample messages
- Roles and permissions

The seed is idempotent — running it again has no effect if data already exists.

### Convex Preview Deployments

For PR previews with isolated backends:

1. Create a preview deployment: `npx convex deploy --preview <branch-name>`
2. Set `NEXT_PUBLIC_CONVEX_URL` to the preview URL
3. Run seed data: `npx convex run seedPreview:seedPreview --preview <branch-name>`

## Custom Domains

### Vercel

1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. SSL is automatic

### Convex

Update `SITE_URL` in the Convex dashboard to match your custom domain.

## Cron Jobs

The following background jobs are configured in `convex/crons.ts`:

| Job | Schedule | Description |
|-----|----------|-------------|
| Cleanup expired invites | Daily, 3:00 AM UTC | Deletes invites older than 7 days |
| Reset monthly credits | 1st of month, midnight UTC | Resets team credit balances |
| Sync subscriptions | Hourly, :15 | Syncs subscription status with billing provider |
| Cleanup stale sessions | Daily, 4:00 AM UTC | Removes auth sessions expired > 24h |

Cron jobs are visible in the Convex dashboard under **Cron Jobs** and execute automatically.

## Rate Limiting

Team-scoped rate limiting via `@convex-dev/rate-limiter`:

| Limit | Type | Rate | Period |
|-------|------|------|--------|
| `sendInvite` | Token bucket | 10/min | Per team |
| `aiRequest` | Token bucket | 20/min | Per team |
| `failedLogin` | Token bucket | 5/hour | Per email |

Rate limits are configured in `convex/rateLimit.ts`.

## Troubleshooting

### Build fails with Sentry errors
Ensure `SENTRY_AUTH_TOKEN` is set in Vercel if `NEXT_PUBLIC_SENTRY_DSN` is configured. Source map upload failures are logged as warnings and won't fail the build.

### Convex functions not updating
Run `npx convex deploy` manually, or check that `CONVEX_DEPLOY_KEY` is set in Vercel.

### PostHog requests blocked
Verify the reverse proxy rewrites in `next.config.js` are active. The PostHog client should use `/ph` as its API host.
