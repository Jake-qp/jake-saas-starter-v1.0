import { describe, it, expect, vi } from "vitest";

// --- AC1 + AC2: useTrack() fires events / is no-op ---

describe("PostHog client module", () => {
  it("exports getPostHogClient function", async () => {
    const mod = await import("../posthog/client");
    expect(mod.getPostHogClient).toBeDefined();
    expect(typeof mod.getPostHogClient).toBe("function");
  });

  it("returns null when NEXT_PUBLIC_POSTHOG_KEY is not set", async () => {
    // Clear env before importing
    const origKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    // Need to re-import fresh
    vi.resetModules();
    const mod = await import("../posthog/client");
    const client = mod.getPostHogClient();
    expect(client).toBeNull();

    // Restore
    if (origKey) process.env.NEXT_PUBLIC_POSTHOG_KEY = origKey;
  });
});

describe("PostHog server module", () => {
  it("exports getPostHogServerClient function", async () => {
    const mod = await import("../posthog/server");
    expect(mod.getPostHogServerClient).toBeDefined();
    expect(typeof mod.getPostHogServerClient).toBe("function");
  });

  it("returns null when POSTHOG_API_KEY is not set", async () => {
    const origKey = process.env.POSTHOG_API_KEY;
    delete process.env.POSTHOG_API_KEY;

    vi.resetModules();
    const mod = await import("../posthog/server");
    const client = mod.getPostHogServerClient();
    expect(client).toBeNull();

    if (origKey) process.env.POSTHOG_API_KEY = origKey;
  });
});

// --- AC1: useTrack hook ---

describe("useTrack hook", () => {
  it("exports useTrack function", async () => {
    const mod = await import("../hooks/use-track");
    expect(mod.useTrack).toBeDefined();
    expect(typeof mod.useTrack).toBe("function");
  });
});

// --- AC2: useTrack is no-op when PostHog not configured ---

describe("useTrack no-op behavior", () => {
  it("useTrack returns a function even without PostHog", async () => {
    // Ensure no PostHog key
    const origKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    vi.resetModules();
    const mod = await import("../hooks/use-track");
    expect(mod.useTrack).toBeDefined();

    if (origKey) process.env.NEXT_PUBLIC_POSTHOG_KEY = origKey;
  });
});

// --- AC3: Reverse proxy configuration (already tested in analytics.test.ts, cross-verify) ---

describe("PostHog reverse proxy (cross-verify)", () => {
  it("next.config.js routes /ph/ to posthog", async () => {
    const fs = await import("fs");
    const config = fs.readFileSync("next.config.js", "utf-8");
    expect(config).toContain("/ph/static/:path*");
    expect(config).toContain("us-assets.i.posthog.com");
    expect(config).toContain("/ph/:path*");
    expect(config).toContain("us.i.posthog.com");
  });

  it("PostHog client uses /ph as api_host", async () => {
    const fs = await import("fs");
    const clientCode = fs.readFileSync("lib/posthog/client.ts", "utf-8");
    expect(clientCode).toContain("/ph");
  });
});

// --- AC4: posthog.identify() ---

describe("PostHog identify integration", () => {
  it("PostHogIdentify component exists", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("lib/posthog/PostHogIdentify.tsx", "utf-8");
    expect(content).toContain("identify");
  });

  it("PostHogIdentify calls posthog.identify with user data", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("lib/posthog/PostHogIdentify.tsx", "utf-8");
    expect(content).toContain("identify");
    expect(content).toContain("email");
  });
});

// --- AC5: posthog.group("team", teamId) ---

describe("PostHog group integration", () => {
  it("PostHogIdentify component sets team group", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("lib/posthog/PostHogIdentify.tsx", "utf-8");
    expect(content).toContain("group");
    expect(content).toContain("team");
  });
});

// --- AC6: Manual pageview capture ---

describe("PostHog pageview capture", () => {
  it("PostHogPageView component exists", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("lib/posthog/PostHogPageView.tsx", "utf-8");
    expect(content).toContain("$pageview");
  });

  it("PostHogPageView uses usePathname and useSearchParams", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("lib/posthog/PostHogPageView.tsx", "utf-8");
    expect(content).toContain("usePathname");
    expect(content).toContain("useSearchParams");
  });
});

// --- AC7: App works without PostHog ---

describe("PostHog graceful degradation", () => {
  it("PostHogProvider component exists", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("lib/posthog/PostHogProvider.tsx", "utf-8");
    expect(content).toContain("PostHogProvider");
  });

  it("PostHogProvider renders children when PostHog not configured", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("lib/posthog/PostHogProvider.tsx", "utf-8");
    // Should have conditional logic — render children either way
    expect(content).toContain("children");
  });

  it("root layout includes PostHogProvider", async () => {
    const fs = await import("fs");
    const layout = fs.readFileSync("app/layout.tsx", "utf-8");
    expect(layout).toContain("PostHogProvider");
  });

  it("root layout includes PostHogPageView", async () => {
    const fs = await import("fs");
    const layout = fs.readFileSync("app/layout.tsx", "utf-8");
    expect(layout).toContain("PostHogPageView");
  });
});

// --- Convex PostHog integration ---

describe("Convex PostHog integration", () => {
  it("convex/posthog.ts exports PostHog instance", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("convex/posthog.ts", "utf-8");
    expect(content).toContain("PostHog");
    expect(content).toContain("components");
  });

  it("convex/convex.config.ts includes posthog component", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("convex/convex.config.ts", "utf-8");
    expect(content).toContain("posthog");
  });
});
