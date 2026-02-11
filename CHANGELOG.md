# Changelog

All notable changes to the SaaS Starter Kit V2 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Analytics & Event Tracking (F001-009): PostHog product analytics with env-var gated graceful degradation, `useTrack()` hook wrapping `posthog.capture()` (no-op when unconfigured), `useFeatureFlag()` for PostHog feature flags, PostHogProvider + PostHogPageView in root layout for manual App Router pageviews, PostHogIdentify for `posthog.identify()` + `posthog.group("team", teamId)`, PostHog server client for API routes (`posthog-node`), Convex-side event tracking via `@samhoque/convex-posthog`, reverse proxy at `/ph/*` (from F001-014)
- Polar Billing + Credits (F001-003): Team-level billing via `@convex-dev/polar` with three-tier plan system (Free/Pro/Enterprise), configurable entitlements in `lib/planConfig.ts`, `checkEntitlement()` enforcement with structured ConvexError on limit hit, credit-based AI billing with per-model costs and calendar-month periods, `decrementCredits()` for post-request tracking, Polar webhook integration (subscription created/updated), billing settings page with real-time usage meters and plan comparison, `CustomerPortalLink` and `CheckoutLink` integration
- Production Infrastructure (F001-014): Sentry error monitoring (client/server/edge) with env-var gated graceful degradation, tunnel route `/monitoring` for ad-blocker avoidance, Vercel Analytics + Speed Insights in root layout, PostHog reverse proxy (`/ph/*` rewrites), 4 Convex cron jobs (invite cleanup, credit reset, subscription sync, session cleanup), team-scoped rate limiting via `@convex-dev/rate-limiter`, preview seed data (`convex/seedPreview.ts`), deployment documentation (`docs/deployment.md`)
- Testing & Quality Infrastructure (F001-016): Vitest + convex-test for unit/integration tests, Playwright + axe-playwright for E2E and accessibility tests, GitHub Actions CI pipeline (type-check, lint, unit tests, E2E), Husky + lint-staged pre-commit hooks, seed test files for permissions/planConfig/auth/accessibility, tightened ESLint rules
- Design System Expansion (F001-002): 8 app-level components (PageHeader, DataTable, EmptyState, StatusBadge, PricingCard, UsageMeter, StepWizard, ThemeToggle), semantic color tokens enforced via ESLint, dark mode support
