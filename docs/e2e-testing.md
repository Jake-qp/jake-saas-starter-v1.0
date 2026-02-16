# E2E Testing with Playwright

End-to-end tests live in `e2e/` and run against a live dev server (Next.js + Convex).

## Quick Start

```bash
# 1. Install browsers (first time only)
npx playwright install chromium

# 2. Run all E2E tests (starts dev server automatically)
npm run test:e2e

# 3. Run in UI mode (interactive debugger)
npm run test:e2e:ui
```

## Test Account Setup

Authenticated tests require a test account. Add these to `.env.local`:

```env
E2E_TEST_EMAIL=e2e-test@example.com
E2E_TEST_PASSWORD=TestPassword123!
```

On first run, Playwright's **global setup** (`e2e/global-setup.ts`) will:

1. Sign up the test account (or sign in if it already exists)
2. Complete onboarding if triggered
3. Save the authenticated browser state to `e2e/.auth/state.json`

This runs once before any tests. All authenticated tests reuse the saved state — no per-test sign-in.

## Test Structure

```
e2e/
  global-setup.ts           # Account provisioning + storageState
  .auth/                    # Saved browser state (gitignored)
  public-pages.spec.ts      # Marketing, legal, blog, auth pages (no auth needed)
  auth.spec.ts              # Sign-in/sign-up/forgot-password flows
  accessibility.spec.ts     # axe-core WCAG scans
  authenticated.spec.ts     # Protected pages (uses storageState)
```

### Playwright Projects

The config (`playwright.config.ts`) defines two projects:

| Project | Auth | Tests |
|---------|------|-------|
| `public` | None | public-pages, auth, accessibility |
| `authenticated` | storageState | authenticated |

Run a specific project:

```bash
npx playwright test --project=public
npx playwright test --project=authenticated
```

## Writing New Tests

### Public page test

```typescript
// e2e/public-pages.spec.ts
import { test, expect } from "@playwright/test";

test("new page loads", async ({ page }) => {
  await page.goto("/new-page");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

### Authenticated page test

```typescript
// e2e/authenticated.spec.ts
import { test, expect } from "@playwright/test";

// storageState is injected by the "authenticated" project —
// the browser is already signed in when the test starts.

test("protected page loads", async ({ page }) => {
  await page.goto("/t");
  await page.waitForURL(/\/t\/[^/]+/);
  const teamPath = new URL(page.url()).pathname;
  await page.goto(`${teamPath}/new-feature`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 15000, // Convex data needs time to hydrate
  });
});
```

### Key patterns

- **Convex hydration timeout**: Pages with Convex data return `null` until the team context loads. Use `{ timeout: 15000 }` on assertions for authenticated pages.
- **Use `{ level: 1 }` for headings**: Avoids strict mode violations when multiple headings match a regex (e.g., h1 "Notes" + h3 "No notes yet" both match `/notes/i`).
- **Use `exact: true` for buttons**: The "Sign in" button and "Sign in with email link" button both match `/sign in/i`. Use `{ name: "Sign in", exact: true }`.

## Running in CI

The CI config (`.github/workflows/ci.yml`) runs E2E tests with:

```yaml
- run: npx playwright install chromium --with-deps
- run: npm run test:e2e
```

Set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` as GitHub Actions secrets for authenticated tests to run in CI. Without them, authenticated tests are skipped (not failed).

## Debugging

```bash
# Run a single test file
npx playwright test e2e/public-pages.spec.ts

# Run a single test by name
npx playwright test --grep "landing page"

# Debug mode (step through in browser)
npx playwright test --debug

# UI mode (best for development)
npm run test:e2e:ui

# Show HTML report from last run
npx playwright show-report
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Tests timeout waiting for dev server | Ensure `npm run dev` works manually first |
| Auth tests skip | Set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` in `.env.local` |
| "strict mode violation" | Selector matches multiple elements — narrow with `{ level: 1 }`, `{ exact: true }`, or `.first()` |
| Onboarding blocks authenticated tests | Delete `e2e/.auth/state.json` to force re-provisioning on next run |
| Convex data doesn't load | Check that `CONVEX_DEPLOYMENT` in `.env.local` points to a running backend |
