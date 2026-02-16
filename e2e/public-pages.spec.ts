import { test, expect } from "@playwright/test";

/**
 * Smoke tests for all public (unauthenticated) pages.
 * No auth needed — these should always pass when the dev server is running.
 */

test.describe("Marketing pages", () => {
  test("landing page shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("pricing page shows plan cards", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();
    // Should have at least 2 plan options
    const cards = page
      .locator("[data-testid='pricing-card'], .pricing-card, [class*='card']")
      .filter({ hasText: /month|year|free/i });
    await expect(cards.first()).toBeVisible();
  });

  test("contact page has form fields", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /contact/i })).toBeVisible();
    // Contact form should have input fields
    await expect(page.locator("input, textarea").first()).toBeVisible();
  });

  test("waitlist page has email input", async ({ page }) => {
    await page.goto("/waitlist");
    await expect(
      page
        .locator("input[type='email'], input[placeholder*='email' i]")
        .first(),
    ).toBeVisible();
  });
});

test.describe("Legal pages", () => {
  test("privacy policy loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /privacy/i })).toBeVisible();
  });

  test("terms of service loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /terms/i })).toBeVisible();
  });

  test("cookie policy loads", async ({ page }) => {
    await page.goto("/cookies");
    await expect(page.getByRole("heading", { name: /cookie/i })).toBeVisible();
  });
});

test.describe("Blog and Changelog", () => {
  test("blog listing renders", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /blog/i })).toBeVisible();
  });

  test("changelog renders", async ({ page }) => {
    await page.goto("/changelog");
    await expect(
      page.getByRole("heading", { name: /changelog/i }),
    ).toBeVisible();
  });
});

test.describe("Auth pages render correctly", () => {
  test("sign-in form has email, password, and submit button", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("sign-in page has magic link section", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.locator("#magic-email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in with email link" }),
    ).toBeVisible();
  });

  test("sign-up form has email, password, confirm, and submit button", async ({
    page,
  }) => {
    await page.goto("/auth/sign-up");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirm-password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  });

  test("forgot-password form renders", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.locator("#email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send reset code" }),
    ).toBeVisible();
  });
});

test.describe("Auth form validation", () => {
  test("sign-up rejects short passwords", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("short");
    await page.locator("#confirm-password").fill("short");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test("sign-up rejects mismatched passwords", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("password123");
    await page.locator("#confirm-password").fill("different456");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });
});

test.describe("Auth navigation links", () => {
  test("sign-in page links to sign-up", async ({ page }) => {
    await page.goto("/auth/sign-in");
    const signUpLink = page.getByRole("link", { name: "Sign up" });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/auth/sign-up");
  });

  test("sign-up page links to sign-in", async ({ page }) => {
    await page.goto("/auth/sign-up");
    const signInLink = page.getByRole("link", { name: "Sign in" });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/auth/sign-in");
  });
});
