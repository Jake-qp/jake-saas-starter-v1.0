import { test, expect } from "@playwright/test";

/**
 * Auth E2E tests.
 *
 * Tests the full sign-up → dashboard flow. Expand when F001-001 (Auth) is built.
 */

test.describe("Authentication", () => {
  test("sign-up page should be accessible", async ({ page }) => {
    await page.goto("/auth/sign-up");
    // TODO: Verify sign-up form renders when F001-001 is built
    // await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
  });

  test("sign-in page should be accessible", async ({ page }) => {
    await page.goto("/auth/sign-in");
    // TODO: Verify sign-in form renders when F001-001 is built
    // await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test.describe("Sign-up flow", () => {
    test.skip("should create account with email/password and redirect to dashboard", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });

    test.skip("should show validation errors for invalid email", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });

    test.skip("should auto-create personal team on first sign-up", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });
  });

  test.describe("Sign-in flow", () => {
    test.skip("should sign in with email/password", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });

    test.skip("should show error for invalid credentials", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });

    test.skip("should support magic link sign-in via email", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });
  });

  test.describe("Forgot password", () => {
    test.skip("should send password reset email", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });
  });

  test.describe("Protected routes", () => {
    test.skip("should redirect unauthenticated users to sign-in", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });

    test.skip("should allow authenticated users to access /t/[teamSlug]", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });
  });
});
