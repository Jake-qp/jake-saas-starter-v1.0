import { chromium, type FullConfig } from "@playwright/test";
import path from "path";

export const STORAGE_STATE = path.join(__dirname, ".auth/state.json");

/**
 * Playwright global setup — provisions the E2E test account.
 *
 * 1. Signs up (if account doesn't exist) or signs in
 * 2. Completes onboarding if triggered
 * 3. Saves authenticated browser state to .auth/state.json
 *
 * All authenticated tests reuse this state via storageState,
 * eliminating per-test sign-in and onboarding handling.
 */
export default async function globalSetup(_config: FullConfig) {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    console.log(
      "[global-setup] E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set — skipping",
    );
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: "http://localhost:3000",
  });
  const page = await context.newPage();

  try {
    // Try sign-up first (idempotent — fails gracefully if account exists)
    await page.goto("/auth/sign-up");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("#confirm-password").fill(password);
    await page.getByRole("button", { name: "Sign up" }).click();

    // Wait for either success redirect or "already exists" error
    const signedUp = await Promise.race([
      page.waitForURL(/\/t/, { timeout: 10000 }).then(() => true),
      page
        .getByText(/already exists|already registered/i)
        .waitFor({ timeout: 10000 })
        .then(() => false),
    ]).catch(() => false);

    // If sign-up failed (account exists), sign in instead
    if (!signedUp) {
      await page.goto("/auth/sign-in");
      await page.locator("#email").fill(email);
      await page.locator("#password").fill(password);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await page.waitForURL(/\/t/, { timeout: 10000 });
    }

    // Complete onboarding if triggered
    await completeOnboarding(page);

    // Save authenticated state
    await context.storageState({ path: STORAGE_STATE });
    console.log("[global-setup] Auth state saved for:", email);
  } catch (err) {
    console.log(
      "[global-setup] Could not provision test account:",
      err instanceof Error ? err.message : err,
    );
  } finally {
    await browser.close();
  }
}

async function completeOnboarding(page: import("@playwright/test").Page) {
  const continueButton = page.getByRole("button", { name: "Continue" });
  const isOnboarding = await continueButton
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  if (!isOnboarding) return;

  // Step 1: Profile
  const nameInput = page.getByRole("textbox", { name: "Display name" });
  if (await nameInput.isVisible().catch(() => false)) {
    const value = await nameInput.inputValue();
    if (!value) await nameInput.fill("E2E Test User");
  }
  await continueButton.click();
  await page.waitForTimeout(1000);

  // Step 2: Team — check for team/workspace input
  const teamInput = page.getByRole("textbox", { name: /team|workspace/i });
  if (await teamInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    const value = await teamInput.inputValue();
    if (!value) await teamInput.fill("E2E Test Team");
    await continueButton.click();
    await page.waitForTimeout(1000);
  }

  // Step 3: Finish
  const finishButton = page.getByRole("button", {
    name: /get started|finish|done|complete/i,
  });
  if (await finishButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await finishButton.click();
  }

  // Wait for final redirect to team dashboard
  await page.waitForURL(/\/t\//, { timeout: 10000 }).catch(() => {});
}
