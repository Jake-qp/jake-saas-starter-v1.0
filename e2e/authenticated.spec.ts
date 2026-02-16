import { test, expect } from "./fixtures/auth";

/**
 * Authenticated page smoke tests.
 *
 * Uses the auth fixture to sign in, then verifies protected pages load.
 * All tests skip gracefully if auth fails (no backend / no test account).
 */

test.describe("Authenticated pages", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Skip all tests in this group if auth didn't succeed
    test.skip(
      !authenticatedPage.url().includes("/t"),
      "Auth required — set E2E_TEST_EMAIL and E2E_TEST_PASSWORD",
    );
  });

  test("dashboard loads", async ({ authenticatedPage: page }) => {
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("notes page renders", async ({ authenticatedPage: page }) => {
    const teamPath = new URL(page.url()).pathname.replace(/\/$/, "");
    await page.goto(`${teamPath}/notes`);
    await expect(page.getByRole("heading", { name: /notes/i })).toBeVisible();
  });

  test("AI chat page loads", async ({ authenticatedPage: page }) => {
    const teamPath = new URL(page.url()).pathname.replace(/\/$/, "");
    await page.goto(`${teamPath}/ai`);
    await expect(
      page
        .getByRole("heading", { name: /ai/i })
        .or(page.locator("textarea, [contenteditable]")),
    ).toBeVisible();
  });

  test("settings profile page loads", async ({ authenticatedPage: page }) => {
    const teamPath = new URL(page.url()).pathname.replace(/\/$/, "");
    await page.goto(`${teamPath}/settings`);
    await expect(
      page.getByRole("heading", { name: /settings|profile/i }),
    ).toBeVisible();
  });

  test("settings members page loads", async ({ authenticatedPage: page }) => {
    const teamPath = new URL(page.url()).pathname.replace(/\/$/, "");
    await page.goto(`${teamPath}/settings/members`);
    await expect(
      page.getByRole("heading", { name: /members|team/i }),
    ).toBeVisible();
  });

  test("settings billing page loads", async ({ authenticatedPage: page }) => {
    const teamPath = new URL(page.url()).pathname.replace(/\/$/, "");
    await page.goto(`${teamPath}/settings/billing`);
    await expect(
      page.getByRole("heading", { name: /billing|plan/i }),
    ).toBeVisible();
  });

  test("settings notifications page loads", async ({
    authenticatedPage: page,
  }) => {
    const teamPath = new URL(page.url()).pathname.replace(/\/$/, "");
    await page.goto(`${teamPath}/settings/notifications`);
    await expect(
      page.getByRole("heading", { name: /notification/i }),
    ).toBeVisible();
  });

  test("notes new button works", async ({ authenticatedPage: page }) => {
    const teamPath = new URL(page.url()).pathname.replace(/\/$/, "");
    await page.goto(`${teamPath}/notes`);

    const newButton = page
      .getByRole("button", { name: /new/i })
      .or(page.getByRole("link", { name: /new/i }));
    if (await newButton.isVisible()) {
      await newButton.click();
      // Should open a form or navigate to a create page
      await expect(
        page.locator("input, textarea, [contenteditable]").first(),
      ).toBeVisible();
    }
  });
});
