import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const STORAGE_STATE = path.join(__dirname, "e2e/.auth/state.json");

export default defineConfig({
  globalSetup: "./e2e/global-setup.ts",
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [
        "public-pages.spec.ts",
        "auth.spec.ts",
        "accessibility.spec.ts",
      ],
    },
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE,
      },
      testMatch: ["authenticated.spec.ts"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
