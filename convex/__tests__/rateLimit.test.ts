import { describe, it, expect, vi } from "vitest";

// Mock the _generated/api module since components won't exist until codegen
vi.mock("../_generated/api", () => ({
  components: {
    rateLimiter: {},
  },
  api: {},
  internal: {},
}));

describe("convex/rateLimit", () => {
  it("exports rateLimiter instance", async () => {
    const mod = await import("../rateLimit");
    expect(mod.rateLimiter).toBeDefined();
  });

  it("rateLimiter has limit method", async () => {
    const mod = await import("../rateLimit");
    expect(typeof mod.rateLimiter.limit).toBe("function");
  });

  it("rateLimiter has check method", async () => {
    const mod = await import("../rateLimit");
    expect(typeof mod.rateLimiter.check).toBe("function");
  });

  it("exports RATE_LIMITS config object", async () => {
    const mod = await import("../rateLimit");
    expect(mod.RATE_LIMITS).toBeDefined();
    expect(mod.RATE_LIMITS.sendInvite).toBeDefined();
    expect(mod.RATE_LIMITS.aiRequest).toBeDefined();
  });

  it("sendInvite uses token bucket algorithm", async () => {
    const mod = await import("../rateLimit");
    expect(mod.RATE_LIMITS.sendInvite.kind).toBe("token bucket");
  });

  it("aiRequest uses token bucket algorithm", async () => {
    const mod = await import("../rateLimit");
    expect(mod.RATE_LIMITS.aiRequest.kind).toBe("token bucket");
  });

  it("failedLogin rate limit exists", async () => {
    const mod = await import("../rateLimit");
    expect(mod.RATE_LIMITS.failedLogin).toBeDefined();
    expect(mod.RATE_LIMITS.failedLogin.kind).toBe("token bucket");
  });
});
