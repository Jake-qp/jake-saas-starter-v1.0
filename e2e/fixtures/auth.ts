import { test as base, expect, type Page } from "@playwright/test";

/**
 * Auth fixture for E2E tests.
 *
 * Provides authenticated page contexts by signing in once and reusing
 * the session state. This avoids signing in for every test.
 *
 * Usage:
 *   import { test, expect } from "./fixtures/auth";
 *   test("authenticated test", async ({ authenticatedPage }) => {
 *     // authenticatedPage is already signed in
 *   });
 *
 * Expand this fixture when F001-001 (Auth) is built with actual
 * sign-in flows.
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // TODO: Implement actual sign-in flow when F001-001 is built
    // 1. Navigate to /auth/sign-in
    // 2. Fill in email/password
    // 3. Submit form
    // 4. Wait for redirect to dashboard
    //
    // For now, this is a placeholder that navigates to the app root.
    await page.goto("/");
    await use(page);
  },
});

export { expect };
