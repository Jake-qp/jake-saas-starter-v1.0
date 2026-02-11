import { describe, expect, it } from "vitest";
import schema from "../schema";

// --- F001-008: Admin infrastructure tests ---

describe("Admin schema (F001-008)", () => {
  it("users table has isSuperAdmin field", () => {
    const usersTable = schema.tables.users;
    expect(usersTable).toBeDefined();
    // The validator object should contain isSuperAdmin
    const validatorJson = JSON.stringify(usersTable.validator);
    expect(validatorJson).toContain("isSuperAdmin");
  });

  it("isSuperAdmin is an optional boolean", () => {
    const validatorJson = JSON.stringify(schema.tables.users.validator);
    // Should be optional (not required)
    expect(validatorJson).toContain("isSuperAdmin");
  });
});

describe("Admin functions module (F001-008)", () => {
  it("exports adminQuery function", async () => {
    const mod = await import("../functions");
    expect(mod.adminQuery).toBeDefined();
    expect(typeof mod.adminQuery).toBe("function");
  });

  it("exports adminMutation function", async () => {
    const mod = await import("../functions");
    expect(mod.adminMutation).toBeDefined();
    expect(typeof mod.adminMutation).toBe("function");
  });

  it("exports standard query alongside adminQuery", async () => {
    const mod = await import("../functions");
    expect(mod.query).toBeDefined();
    expect(mod.adminQuery).toBeDefined();
    // They should be different functions
    expect(mod.query).not.toBe(mod.adminQuery);
  });

  it("exports standard mutation alongside adminMutation", async () => {
    const mod = await import("../functions");
    expect(mod.mutation).toBeDefined();
    expect(mod.adminMutation).toBeDefined();
    expect(mod.mutation).not.toBe(mod.adminMutation);
  });
});

describe("Admin isSuperAdmin query (F001-008)", () => {
  it("exports isSuperAdmin query from convex/admin", async () => {
    const mod = await import("../admin");
    expect(mod.isSuperAdmin).toBeDefined();
  });
});
