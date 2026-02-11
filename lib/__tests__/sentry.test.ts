import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Sentry configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("sentry.client.config exists", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const configPath = path.resolve(process.cwd(), "sentry.client.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it("sentry.server.config exists", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const configPath = path.resolve(process.cwd(), "sentry.server.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it("sentry.edge.config exists", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const configPath = path.resolve(process.cwd(), "sentry.edge.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it("instrumentation.ts exists", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const configPath = path.resolve(process.cwd(), "instrumentation.ts");
    expect(fs.existsSync(configPath)).toBe(true);
  });
});

describe("Sentry graceful degradation", () => {
  it("client config handles missing DSN without error", async () => {
    // Read the config file as text and verify it checks for DSN
    const fs = await import("fs");
    const content = fs.readFileSync("sentry.client.config.ts", "utf-8");
    expect(content).toContain("NEXT_PUBLIC_SENTRY_DSN");
    expect(content).toContain("enabled");
  });

  it("server config handles missing DSN without error", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("sentry.server.config.ts", "utf-8");
    expect(content).toContain("NEXT_PUBLIC_SENTRY_DSN");
    expect(content).toContain("enabled");
  });
});

describe("Sentry tunnel route", () => {
  it("next.config.js includes tunnelRoute configuration", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("next.config.js", "utf-8");
    expect(content).toContain("tunnelRoute");
    expect(content).toContain("/monitoring");
  });
});
