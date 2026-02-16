import { test, expect } from "@playwright/test";

/**
 * Authenticated page smoke tests.
 *
 * Uses storageState from global-setup (Playwright config "authenticated" project).
 * The browser is already signed in — no per-test auth needed.
 *
 * All assertions target the page's h1 heading ({level: 1}) which is the
 * reliable indicator that Convex data has hydrated and the page rendered.
 * This avoids regex selectors matching multiple headings (h1, h2, h3).
 */

const CONVEX_TIMEOUT = 15000;

async function getTeamPath(page: import("@playwright/test").Page) {
  await page.goto("/t");
  await page.waitForURL(/\/t\/[^/]+/, { timeout: CONVEX_TIMEOUT });
  return new URL(page.url()).pathname.replace(/\/$/, "");
}

test.describe("Authenticated pages", () => {
  test("dashboard loads", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(teamPath);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: CONVEX_TIMEOUT,
    });
  });

  test("notes page renders", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(`${teamPath}/notes`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: CONVEX_TIMEOUT,
    });
  });

  test("AI chat page loads", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(`${teamPath}/ai`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: CONVEX_TIMEOUT,
    });
  });

  test("settings profile page loads", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(`${teamPath}/settings`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: CONVEX_TIMEOUT,
    });
  });

  test("settings members page loads", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(`${teamPath}/settings/members`);
    // Personal teams redirect to /settings — either way an h1 should appear
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: CONVEX_TIMEOUT,
    });
  });

  test("settings billing page loads", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(`${teamPath}/settings/billing`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: CONVEX_TIMEOUT,
    });
  });

  test("settings notifications page loads", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(`${teamPath}/settings/notifications`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: CONVEX_TIMEOUT,
    });
  });

  test("notes new button works", async ({ page }) => {
    const teamPath = await getTeamPath(page);
    await page.goto(`${teamPath}/notes`);

    const newButton = page.getByRole("button", { name: /new note/i });
    await expect(newButton).toBeVisible({ timeout: CONVEX_TIMEOUT });
    await newButton.click();
    await expect(
      page.locator("input, textarea, [contenteditable]").first(),
    ).toBeVisible();
  });
});
