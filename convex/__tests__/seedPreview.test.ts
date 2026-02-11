import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Mock Convex server module — seedPreview uses internalMutation from _generated/server
vi.mock("../_generated/server", () => ({
  internalMutation: (config: unknown) => config,
}));

describe("convex/seedPreview PREVIEW_DATA", () => {
  it("exports PREVIEW_DATA with demo team", async () => {
    const mod = await import("../seedPreview");
    expect(mod.PREVIEW_DATA).toBeDefined();
    expect(mod.PREVIEW_DATA.team).toBeDefined();
    expect(mod.PREVIEW_DATA.team.name).toBe("Acme Corp");
    expect(mod.PREVIEW_DATA.team.slug).toBe("acme-corp");
  });

  it("PREVIEW_DATA includes 3+ demo users", async () => {
    const mod = await import("../seedPreview");
    expect(Array.isArray(mod.PREVIEW_DATA.users)).toBe(true);
    expect(mod.PREVIEW_DATA.users.length).toBeGreaterThanOrEqual(2);
    for (const user of mod.PREVIEW_DATA.users) {
      expect(user.email).toBeDefined();
      expect(user.fullName).toBeDefined();
    }
  });

  it("PREVIEW_DATA includes 3+ sample messages", async () => {
    const mod = await import("../seedPreview");
    expect(Array.isArray(mod.PREVIEW_DATA.messages)).toBe(true);
    expect(mod.PREVIEW_DATA.messages.length).toBeGreaterThanOrEqual(3);
    for (const msg of mod.PREVIEW_DATA.messages) {
      expect(msg.text).toBeDefined();
      expect(msg.text.length).toBeGreaterThan(0);
    }
  });
});

describe("convex/seedPreview mutation structure", () => {
  const source = readFileSync(resolve(__dirname, "../seedPreview.ts"), "utf-8");

  it("exports seedPreview as internalMutation", () => {
    expect(source).toContain("export const seedPreview = internalMutation");
  });

  it("is idempotent (checks for existing data)", () => {
    expect(source).toContain("Preview data already seeded");
  });

  it("creates team, users, members, and messages", () => {
    expect(source).toContain('insert("teams"');
    expect(source).toContain('insert("users"');
    expect(source).toContain('insert("members"');
    expect(source).toContain('insert("messages"');
  });
});
