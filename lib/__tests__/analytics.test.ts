import { describe, it, expect } from "vitest";

describe("Vercel Analytics integration", () => {
  it("@vercel/analytics is installed", async () => {
    const pkg = await import("@vercel/analytics/react");
    expect(pkg.Analytics).toBeDefined();
  });

  it("root layout includes Analytics component", async () => {
    const fs = await import("fs");
    const layout = fs.readFileSync("app/layout.tsx", "utf-8");
    expect(layout).toContain("Analytics");
    expect(layout).toContain("@vercel/analytics");
  });
});

describe("Vercel Speed Insights integration", () => {
  it("@vercel/speed-insights is installed", async () => {
    const pkg = await import("@vercel/speed-insights/next");
    expect(pkg.SpeedInsights).toBeDefined();
  });

  it("root layout includes SpeedInsights component", async () => {
    const fs = await import("fs");
    const layout = fs.readFileSync("app/layout.tsx", "utf-8");
    expect(layout).toContain("SpeedInsights");
    expect(layout).toContain("@vercel/speed-insights");
  });
});

describe("PostHog reverse proxy configuration", () => {
  it("next.config.js has PostHog rewrites", async () => {
    const fs = await import("fs");
    const config = fs.readFileSync("next.config.js", "utf-8");
    expect(config).toContain("/ph");
    expect(config).toContain("us.i.posthog.com");
  });

  it("PostHog rewrites include both ingest and static paths", async () => {
    const fs = await import("fs");
    const config = fs.readFileSync("next.config.js", "utf-8");
    expect(config).toContain("/ph/static/:path*");
    expect(config).toContain("/ph/:path*");
  });
});

describe("PostHog graceful degradation", () => {
  it("PostHog proxy rewrites are always present (no env check for rewrites)", async () => {
    // Rewrites are always defined in next.config.js
    // The actual PostHog client (F001-009) will check for NEXT_PUBLIC_POSTHOG_KEY
    // Rewrites don't hurt if PostHog is not configured
    const fs = await import("fs");
    const config = fs.readFileSync("next.config.js", "utf-8");
    expect(config).toContain("rewrites");
  });
});
