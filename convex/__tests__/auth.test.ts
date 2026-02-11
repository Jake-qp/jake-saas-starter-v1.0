import { describe, expect, it } from "vitest";
import schema from "../schema";

/**
 * Auth migration tests (F001-001).
 *
 * Tests that the schema correctly includes Convex Auth tables,
 * removes tokenIdentifier, and adds new user fields.
 */

describe("auth schema (F001-001)", () => {
  describe("Convex Auth tables exist", () => {
    it("should define authSessions table", () => {
      expect(schema.tables.authSessions).toBeDefined();
    });

    it("should define authAccounts table", () => {
      expect(schema.tables.authAccounts).toBeDefined();
    });

    it("should define authRefreshTokens table", () => {
      expect(schema.tables.authRefreshTokens).toBeDefined();
    });

    it("should define authVerificationCodes table", () => {
      expect(schema.tables.authVerificationCodes).toBeDefined();
    });

    it("should define authVerifiers table", () => {
      expect(schema.tables.authVerifiers).toBeDefined();
    });

    it("should define authRateLimits table", () => {
      expect(schema.tables.authRateLimits).toBeDefined();
    });
  });

  describe("users table migration", () => {
    it("should define the users table", () => {
      expect(schema.tables.users).toBeDefined();
    });

    it("should have email index on users", () => {
      const usersTable = schema.tables.users;
      expect(usersTable.indexes).toBeDefined();
      // Verify the email index exists
      const indexNames = usersTable.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("email");
    });

    it("should have phone index on users", () => {
      const usersTable = schema.tables.users;
      const indexNames = usersTable.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("phone");
    });

    it("should NOT have tokenIdentifier index", () => {
      const usersTable = schema.tables.users;
      const indexNames = usersTable.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).not.toContain("tokenIdentifier");
    });
  });

  describe("auth session table structure", () => {
    it("should have userId index on authSessions", () => {
      const table = schema.tables.authSessions;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("userId");
    });

    it("should have userIdAndProvider index on authAccounts", () => {
      const table = schema.tables.authAccounts;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("userIdAndProvider");
    });

    it("should have providerAndAccountId index on authAccounts", () => {
      const table = schema.tables.authAccounts;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("providerAndAccountId");
    });
  });

  describe("core tables preserved", () => {
    it("should still define teams table", () => {
      expect(schema.tables.teams).toBeDefined();
    });

    it("should still define members table", () => {
      expect(schema.tables.members).toBeDefined();
    });

    it("should still define invites table", () => {
      expect(schema.tables.invites).toBeDefined();
    });

    it("should still define roles table", () => {
      expect(schema.tables.roles).toBeDefined();
    });

    it("should still define permissions table", () => {
      expect(schema.tables.permissions).toBeDefined();
    });

    it("should still define messages table", () => {
      expect(schema.tables.messages).toBeDefined();
    });
  });
});
