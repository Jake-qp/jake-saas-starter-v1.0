import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility E2E tests.
 *
 * Runs axe-core scans on key pages to check WCAG compliance.
 * Expand as new pages are added.
 */

test.describe("Accessibility", () => {
  test("landing page should have no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });

  test.describe("Public pages", () => {
    test.skip("pricing page should have no critical accessibility violations", async () => {
      // TODO: Implement when F001-012 (Marketing) is built
    });

    test.skip("contact page should have no critical accessibility violations", async () => {
      // TODO: Implement when F001-012 (Marketing) is built
    });

    test.skip("blog listing should have no critical accessibility violations", async () => {
      // TODO: Implement when F001-013 (Blog) is built
    });
  });

  test.describe("Auth pages", () => {
    test.skip("sign-in page should have no critical accessibility violations", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });

    test.skip("sign-up page should have no critical accessibility violations", async () => {
      // TODO: Implement when F001-001 (Auth) is built
    });
  });

  test.describe("Authenticated pages", () => {
    test.skip("dashboard should have no critical accessibility violations", async () => {
      // TODO: Implement when dashboard is built
    });

    test.skip("settings page should have no critical accessibility violations", async () => {
      // TODO: Implement when settings is built
    });
  });
});
