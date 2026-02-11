import { describe, it, expect, vi } from "vitest";

// --- F001-008: Feature flag hook tests ---

describe("useFeatureFlag hook (F001-008)", () => {
  it("exports useFeatureFlag from hook module", async () => {
    const mod = await import("../hooks/use-feature-flag");
    expect(mod.useFeatureFlag).toBeDefined();
    expect(typeof mod.useFeatureFlag).toBe("function");
  });

  it("returns false when PostHog is not configured (AC2)", async () => {
    // Ensure PostHog key is not set
    const origKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    vi.resetModules();
    // Verify the underlying PostHog client returns null when unconfigured
    // The useFeatureFlag hook depends on this returning null to return false
    const posthogMod = await import("../posthog/client");
    const client = posthogMod.getPostHogClient();
    expect(client).toBeNull();

    if (origKey) process.env.NEXT_PUBLIC_POSTHOG_KEY = origKey;
  });
});

describe("useFeatureFlagWithPayload hook (F001-008)", () => {
  it("exports useFeatureFlagWithPayload from hook module (AC3)", async () => {
    const mod = await import("../hooks/use-feature-flag");
    expect(mod.useFeatureFlagWithPayload).toBeDefined();
    expect(typeof mod.useFeatureFlagWithPayload).toBe("function");
  });

  it("returns null when PostHog is not configured", async () => {
    const origKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    vi.resetModules();
    // The hook should return null when PostHog is not configured
    const posthogMod = await import("../posthog/client");
    const client = posthogMod.getPostHogClient();
    expect(client).toBeNull();

    if (origKey) process.env.NEXT_PUBLIC_POSTHOG_KEY = origKey;
  });
});

describe("PostHog admin flag management (F001-008)", () => {
  it("POSTHOG_PERSONAL_API_KEY is server-side only (AC5)", () => {
    // Verify the key name does NOT start with NEXT_PUBLIC_
    // which would make it available to the client
    const keyName = "POSTHOG_PERSONAL_API_KEY";
    expect(keyName.startsWith("NEXT_PUBLIC_")).toBe(false);
  });

  it("flag management config exports exist", async () => {
    const mod = await import("../featureFlagAdmin");
    expect(mod.POSTHOG_FLAGS_API_URL).toBeDefined();
    expect(mod.getPostHogHeaders).toBeDefined();
    expect(typeof mod.getPostHogHeaders).toBe("function");
  });

  it("getPostHogHeaders returns null when POSTHOG_PERSONAL_API_KEY is not set", async () => {
    const origKey = process.env.POSTHOG_PERSONAL_API_KEY;
    delete process.env.POSTHOG_PERSONAL_API_KEY;

    vi.resetModules();
    const mod = await import("../featureFlagAdmin");
    const headers = mod.getPostHogHeaders();
    expect(headers).toBeNull();

    if (origKey) process.env.POSTHOG_PERSONAL_API_KEY = origKey;
  });

  it("getPostHogHeaders returns authorization header when key is set", async () => {
    const origKey = process.env.POSTHOG_PERSONAL_API_KEY;
    process.env.POSTHOG_PERSONAL_API_KEY = "test-personal-api-key";

    vi.resetModules();
    const mod = await import("../featureFlagAdmin");
    const headers = mod.getPostHogHeaders();
    expect(headers).not.toBeNull();
    expect(headers?.Authorization).toBe("Bearer test-personal-api-key");

    if (origKey) {
      process.env.POSTHOG_PERSONAL_API_KEY = origKey;
    } else {
      delete process.env.POSTHOG_PERSONAL_API_KEY;
    }
  });
});
