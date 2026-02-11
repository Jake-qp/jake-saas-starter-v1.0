# Feature Specs Index

## Feature Specs

| ID | Name | Status | Spec File |
|----|------|--------|-----------|
| F001-001 | Convex Auth Migration + Magic Link | ✅ | `docs/specs/F001-001-convex-auth.spec` |
| F001-002 | Design System Expansion | ✅ | (built before spec system) |
| F001-014 | Production Infrastructure | ✅ | `docs/specs/F001-014-production-infrastructure.spec` |
| F001-016 | Testing & Quality Infrastructure | ✅ | `docs/specs/F001-016-testing-quality-infrastructure.spec` |
| F001-003 | Polar Billing + Credit System | ✅ | `docs/specs/F001-003-polar-billing.spec` |
| F001-009 | Analytics & Event Tracking (PostHog) | ✅ | `docs/specs/F001-009-analytics-posthog.spec` |
| F001-012 | Marketing Site & Legal Pages | ✅ | `docs/specs/F001-012-marketing-legal.spec` |
| F001-017 | File Storage & Uploads | ✅ | `docs/specs/F001-017-file-storage.spec` |
| F001-008 | Feature Flags (PostHog) | ✅ | `docs/specs/F001-008-feature-flags.spec` |

## Source Code Index

### F001-001 — Convex Auth

| Module | Location | Purpose |
|--------|----------|---------|
| Auth config | `convex/auth.ts` | Convex Auth providers + afterUserCreatedOrUpdated callback |
| Auth config (providers) | `convex/auth.config.ts` | Auth provider domain config |
| ResendOTP provider | `convex/helpers/ResendOTP.ts` | Magic link email OTP via Resend |
| HTTP router | `convex/http.ts` | HTTP routes (auth endpoints) |
| Schema (auth tables) | `convex/schema.ts` | 6 auth tables via defineEntFromTable + user fields |
| Functions (auth) | `convex/functions.ts` | getAuthUserId() integration |
| Users | `convex/users.ts` | viewer, updateProfile, listSessions, getTeamSlug |
| Sessions | `convex/sessions.ts` | invalidateOtherSessions mutation |
| Middleware | `middleware.ts` | convexAuthNextjsMiddleware route protection |
| Client provider | `app/ConvexClientProvider.tsx` | ConvexAuthNextjsProvider wrapper |
| Server layout | `app/layout.tsx` | ConvexAuthNextjsServerProvider wrapper |
| Sign in | `app/auth/sign-in/page.tsx` | Password + magic link sign-in |
| Sign up | `app/auth/sign-up/page.tsx` | Email/password registration |
| Forgot password | `app/auth/forgot-password/page.tsx` | Password reset flow |
| Profile settings | `app/t/[teamSlug]/settings/profile/page.tsx` | Profile, timezone, sessions |
| Auth tests | `convex/__tests__/auth.test.ts` | 19 schema tests |

### F001-016 — Testing & Quality

| Module | Location | Purpose |
|--------|----------|---------|
| Vitest config | `vitest.config.ts` | Unit/integration test runner configuration |
| Playwright config | `playwright.config.ts` | E2E test runner configuration |
| Test setup | `tests/setup.ts` | Vitest global setup (jest-dom matchers) |
| CI pipeline | `.github/workflows/ci.yml` | GitHub Actions: type-check, lint, test, e2e |
| Pre-commit hooks | `.husky/pre-commit` | Husky + lint-staged hook |
| ESLint config | `.eslintrc.cjs` | Linting rules + design system enforcement |
| Component tests | `components/__tests__/` | React Testing Library component tests |
| Convex tests | `convex/__tests__/` | Convex function tests (convex-test) |
| Lib tests | `lib/__tests__/` | Utility function tests |
| E2E tests | `e2e/` | Playwright E2E + accessibility tests |
| E2E fixtures | `e2e/fixtures/` | Reusable Playwright test fixtures |

### F001-014 — Production Infrastructure

| Module | Location | Purpose |
|--------|----------|---------|
| Sentry client config | `sentry.client.config.ts` | Browser-side error capture + replay |
| Sentry server config | `sentry.server.config.ts` | Server-side error capture |
| Sentry edge config | `sentry.edge.config.ts` | Edge runtime error capture |
| Instrumentation | `instrumentation.ts` | Next.js instrumentation hook for Sentry |
| Global error boundary | `app/global-error.tsx` | App-wide error boundary with Sentry reporting |
| Next.js config | `next.config.js` | Sentry wrapping, PostHog proxy, instrumentation hook |
| Middleware | `middleware.ts` | Excludes /monitoring from auth middleware |
| Root layout | `app/layout.tsx` | Vercel Analytics + SpeedInsights components |
| Rate limiter | `convex/rateLimit.ts` | @convex-dev/rate-limiter config (sendInvite, aiRequest, failedLogin) |
| Component config | `convex/convex.config.ts` | Convex app components (rate-limiter) |
| Cron scheduler | `convex/crons.ts` | 4 recurring cron jobs |
| Cron handlers | `convex/cronJobs.ts` | Internal mutations for cron execution |
| Seed data | `convex/seedPreview.ts` | Preview deployment demo data |
| Deployment docs | `docs/deployment.md` | Vercel + Convex deployment guide |
| Rate limit tests | `convex/__tests__/rateLimit.test.ts` | Rate limiter config tests |
| Cron tests | `convex/__tests__/crons.test.ts` | Cron structure tests |
| Seed tests | `convex/__tests__/seedPreview.test.ts` | Seed data structure tests |
| Sentry tests | `lib/__tests__/sentry.test.ts` | Sentry config file tests |
| Analytics tests | `lib/__tests__/analytics.test.ts` | Analytics + PostHog proxy tests |

### F001-003 — Polar Billing + Credits

| Module | Location | Purpose |
|--------|----------|---------|
| Plan config | `lib/planConfig.ts` | Tier definitions, limits, features, credit costs |
| Entitlements | `convex/entitlements.ts` | checkEntitlement(), getCurrentUsage(), decrementCredits() |
| Billing module | `convex/billing.ts` | Polar component setup, queries, mutations |
| HTTP webhooks | `convex/http.ts` | Polar webhook routes (onSubscriptionCreated/Updated) |
| Schema (billing) | `convex/schema.ts` | Teams billing fields + aiUsage table |
| Component config | `convex/convex.config.ts` | Polar component registration |
| Cron handlers | `convex/cronJobs.ts` | Credit reset + subscription sync implementations |
| Billing settings | `app/t/[teamSlug]/settings/billing/page.tsx` | Billing UI with plan info, usage meters, checkout |
| Settings menu | `app/t/[teamSlug]/settings/SettingsMenu.tsx` | Added Billing nav link |
| Plan config tests | `lib/__tests__/planConfig.test.ts` | 27 tests for plan config logic |
| Billing tests | `convex/__tests__/billing.test.ts` | 29 tests for schema + entitlement logic |

### F001-009 — Analytics & Event Tracking (PostHog)

| Module | Location | Purpose |
|--------|----------|---------|
| PostHog client | `lib/posthog/client.ts` | Browser singleton with /ph reverse proxy, env-var gated |
| PostHog server | `lib/posthog/server.ts` | Server-side singleton for API routes (posthog-node) |
| PostHogProvider | `lib/posthog/PostHogProvider.tsx` | Client component that initializes PostHog on mount |
| PostHogPageView | `lib/posthog/PostHogPageView.tsx` | Manual pageview capture for App Router navigation |
| PostHogIdentify | `lib/posthog/PostHogIdentify.tsx` | User identify + team group integration |
| useTrack | `lib/hooks/use-track.ts` | Hook wrapping posthog.capture() — no-op when unconfigured |
| useFeatureFlag | `lib/hooks/use-feature-flag.ts` | Hook for PostHog feature flag evaluation |
| Convex PostHog | `convex/posthog.ts` | @samhoque/convex-posthog instance for server-side events |
| Component config | `convex/convex.config.ts` | PostHog component registration |
| Root layout | `app/layout.tsx` | PostHogProvider + PostHogPageView integration |
| PostHog tests | `lib/__tests__/posthog.test.ts` | 19 tests for all PostHog modules |

### F001-012 — Marketing Site & Legal Pages

| Module | Location | Purpose |
|--------|----------|---------|
| Landing page | `app/(marketing)/page.tsx` | Hero, features, pricing, FAQ, CTA sections |
| Pricing page | `app/(marketing)/pricing/page.tsx` | Standalone pricing comparison |
| Contact page | `app/(marketing)/contact/page.tsx` | Contact form with Zod validation |
| Contact API | `app/api/contact/route.ts` | Resend email integration |
| Legal pages | `app/(marketing)/legal/[slug]/page.tsx` | Terms, privacy, cookies via MDX |
| Marketing layout | `app/(marketing)/layout.tsx` | Shared marketing nav/footer |
| Marketing content | `lib/marketing-content.ts` | Shared content data (features, FAQ, etc.) |
| Contact schema | `lib/contact-schema.ts` | Zod validation for contact form |
| MDX content | `content/legal/` | Terms, privacy, cookies MDX files |

### F001-017 — File Storage & Uploads

| Module | Location | Purpose |
|--------|----------|---------|
| Storage backend | `convex/storage.ts` | Upload URL generation, file save, avatar management, deletion |
| File config | `lib/fileConfig.ts` | Shared validation: allowed types, size limits, avatar constraints |
| Upload hook | `lib/hooks/use-file-upload.ts` | React hook for 3-step Convex upload flow with progress |
| FileUploader | `components/FileUploader.tsx` | Drag-drop upload zone with progress bars and validation |
| AvatarUpload | `components/AvatarUpload.tsx` | Avatar display with upload/remove actions |
| FileAttachment | `components/FileAttachment.tsx` | Inline image display and download links |
| Schema (files) | `convex/schema.ts` | `files` table + `avatarStorageId` on users/teams |
| Entitlements | `convex/entitlements.ts` | `storageQuotaMB` enforcement via file size summation |
| Profile avatar | `app/t/[teamSlug]/settings/profile/page.tsx` | User avatar upload UI |
| Team avatar | `app/t/[teamSlug]/settings/page.tsx` | Team avatar upload UI |
| Teams query | `convex/users/teams.ts` | `avatarStorageId` in team list |
| Storage tests | `convex/__tests__/storage.test.ts` | 34 tests: schema, validation, file config |

### F001-008 — Feature Flags (PostHog)

| Module | Location | Purpose |
|--------|----------|---------|
| isSuperAdmin query | `convex/admin.ts` | Check if current user is super admin |
| Admin functions | `convex/functions.ts` | `adminQuery`/`adminMutation` wrappers enforcing isSuperAdmin |
| Feature flag hooks | `lib/hooks/use-feature-flag.ts` | `useFeatureFlag(key)` + `useFeatureFlagWithPayload(key)` |
| Flag admin helpers | `lib/featureFlagAdmin.ts` | PostHog REST API URL + auth headers (server-only) |
| Admin auth | `lib/adminAuth.ts` | `verifySuperAdmin()` for Next.js API routes |
| Flags API (list/create) | `app/api/admin/flags/route.ts` | GET/POST proxying PostHog feature flags API |
| Flags API (toggle/delete) | `app/api/admin/flags/[id]/route.ts` | PATCH/DELETE for individual flags |
| Admin layout | `app/admin/layout.tsx` | Admin panel layout with sidebar |
| Flags UI | `app/admin/flags/page.tsx` | Flag management table with CRUD actions |
| Schema | `convex/schema.ts` | `isSuperAdmin` field on users table |
| Admin tests | `convex/__tests__/admin.test.ts` | 7 tests: schema, admin functions |
| Flag hook tests | `lib/__tests__/featureFlags.test.ts` | 7 tests: hooks, graceful degradation |
| Admin auth tests | `lib/__tests__/adminAuth.test.ts` | 6 tests: API routes, security |

## Concept Index

| Concept | Definition | Location |
|---------|------------|----------|
| Seed test | Test file with `.todo()` or `.skip()` placeholders for future feature implementation | `convex/__tests__/`, `lib/__tests__/`, `e2e/` |
| Design system enforcement | ESLint rules banning raw Tailwind colors, inline styles, lucide-react, direct Radix imports | `.eslintrc.cjs`, `eslint-rules/` |
| Pre-commit quality gate | Lint-staged runs eslint, prettier, and vitest related on staged files before each commit | `package.json` lint-staged config |
