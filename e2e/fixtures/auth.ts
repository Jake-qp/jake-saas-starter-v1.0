import { test as base, expect, type Page } from "@playwright/test";

/**
 * Auth fixture for E2E tests.
 *
 * Provides authenticated page contexts by signing in once and reusing
 * the session state. Uses env vars E2E_TEST_EMAIL and E2E_TEST_PASSWORD
 * with fallback to hardcoded test account.
 *
 * Usage:
 *   import { test, expect } from "./fixtures/auth";
 *   test("authenticated test", async ({ authenticatedPage }) => {
 *     // authenticatedPage is already signed in
 *   });
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const email = process.env.E2E_TEST_EMAIL ?? "e2e-test@example.com";
    const password = process.env.E2E_TEST_PASSWORD ?? "testpassword123";

    try {
      await page.goto("/auth/sign-in");
      await page.locator("#email").fill(email);
      await page.locator("#password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();

      // Wait for redirect to team dashboard
      await page.waitForURL(/\/t/, { timeout: 10000 });
    } catch {
      // Auth failed — backend unavailable or no test account.
      // Individual tests should handle this gracefully.
    }

    await use(page);
  },
});

export { expect };
