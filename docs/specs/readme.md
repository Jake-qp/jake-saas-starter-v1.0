# Feature Specs Index

## Feature Specs

| ID | Name | Status | Spec File |
|----|------|--------|-----------|
| F001-001 | Convex Auth Migration + Magic Link | ✅ | `docs/specs/F001-001-convex-auth.spec` |
| F001-002 | Design System Expansion | ✅ | (built before spec system) |
| F001-016 | Testing & Quality Infrastructure | ✅ | `docs/specs/F001-016-testing-quality-infrastructure.spec` |

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

## Concept Index

| Concept | Definition | Location |
|---------|------------|----------|
| Seed test | Test file with `.todo()` or `.skip()` placeholders for future feature implementation | `convex/__tests__/`, `lib/__tests__/`, `e2e/` |
| Design system enforcement | ESLint rules banning raw Tailwind colors, inline styles, lucide-react, direct Radix imports | `.eslintrc.cjs`, `eslint-rules/` |
| Pre-commit quality gate | Lint-staged runs eslint, prettier, and vitest related on staged files before each commit | `package.json` lint-staged config |
