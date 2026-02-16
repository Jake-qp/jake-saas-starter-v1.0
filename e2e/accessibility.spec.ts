import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility E2E tests.
 *
 * Runs axe-core scans on key pages to check WCAG 2.0 AA compliance.
 * Only flags critical violations.
 */

function axeScan(page: import("@playwright/test").Page) {
  return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
}

test.describe("Accessibility — Public pages", () => {
  test("landing page has no critical violations", async ({ page }) => {
    await page.goto("/");
    const results = await axeScan(page);
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });

  test("pricing page has no critical violations", async ({ page }) => {
    await page.goto("/pricing");
    const results = await axeScan(page);
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });

  test("contact page has no critical violations", async ({ page }) => {
    await page.goto("/contact");
    const results = await axeScan(page);
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });

  test("blog listing has no critical violations", async ({ page }) => {
    await page.goto("/blog");
    const results = await axeScan(page);
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });
});

test.describe("Accessibility — Auth pages", () => {
  test("sign-in page has no critical violations", async ({ page }) => {
    await page.goto("/auth/sign-in");
    const results = await axeScan(page);
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });

  test("sign-up page has no critical violations", async ({ page }) => {
    await page.goto("/auth/sign-up");
    const results = await axeScan(page);
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });

  test("forgot-password page has no critical violations", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    const results = await axeScan(page);
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });
});
