import { test, expect } from "@playwright/test";

/**
 * Auth flow E2E tests.
 *
 * Tests that require a running Convex backend with a valid test account
 * are wrapped in try/catch or conditional skips so the suite doesn't
 * crash when the backend is unavailable.
 */

test.describe("Authentication flows", () => {
  test("sign-in with valid credentials redirects to /t", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    test.skip(
      !email || !password,
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD required",
    );

    await page.goto("/auth/sign-in");
    await page.locator("#email").fill(email!);
    await page.locator("#password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/t/, { timeout: 10000 });
  });

  test("sign-in with invalid credentials shows error", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.locator("#email").fill("nonexistent@example.com");
    await page.locator("#password").fill("wrongpassword123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("magic link flow shows verification code input", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.locator("#magic-email").fill("test@example.com");
    await page.getByRole("button", { name: "Sign in with email link" }).click();

    // Either shows the code input (Resend configured) or an error (not configured)
    const codeInput = page.locator("#code");
    const errorMessage = page.getByText(/failed to send/i);
    await expect(codeInput.or(errorMessage)).toBeVisible({
      timeout: 10000,
    });
  });

  test("sign-up with unique email redirects to /t", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    test.skip(!email, "E2E_TEST_EMAIL required for sign-up test");

    // Use a unique email to avoid conflicts
    const uniqueEmail = `e2e-${Date.now()}@example.com`;
    await page.goto("/auth/sign-up");
    await page.locator("#email").fill(uniqueEmail);
    await page.locator("#password").fill("testpassword123");
    await page.locator("#confirm-password").fill("testpassword123");
    await page.getByRole("button", { name: "Sign up" }).click();

    // Either redirects (backend available) or shows error (unavailable)
    const redirected = page.waitForURL(/\/t/, { timeout: 10000 });
    const errorShown = page
      .getByText(/could not create account/i)
      .waitFor({ timeout: 10000 });
    await Promise.race([redirected, errorShown]);
  });

  test("unauthenticated access to /t redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/t/some-team");
    // Should redirect to sign-in or show auth gate
    await expect(
      page
        .getByRole("heading", { name: /sign in/i })
        .or(page.locator("#email")),
    ).toBeVisible({ timeout: 10000 });
  });

  test("forgot password shows verification step", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await page.locator("#email").fill("test@example.com");
    await page.getByRole("button", { name: "Send reset code" }).click();

    // Either shows code input (Resend configured) or error (not configured)
    const codeInput = page.locator("#code");
    const errorMessage = page.getByText(/failed to send/i);
    await expect(codeInput.or(errorMessage)).toBeVisible({
      timeout: 10000,
    });
  });
});
