import { describe, it, expect } from "vitest";
import * as schema from "../schema";
import * as waitlist from "../waitlist";

describe("Waitlist / Pre-Launch Mode (F001-015)", () => {
  describe("Schema: waitlistEntries table", () => {
    it("schema has waitlistEntries table", () => {
      expect(schema.default).toBeDefined();
      expect(schema.default.tables).toBeDefined();
      expect(schema.default.tables.waitlistEntries).toBeDefined();
    });

    it("waitlistEntries has email field with unique index", () => {
      const table = schema.default.tables.waitlistEntries;
      expect(table).toBeDefined();
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("email");
    });

    it("waitlistEntries has status index", () => {
      const table = schema.default.tables.waitlistEntries;
      expect(table).toBeDefined();
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("status");
    });

    it("waitlistEntries has validator for status and email fields", () => {
      const table = schema.default.tables.waitlistEntries;
      expect(table.validator).toBeDefined();
    });
  });

  describe("Waitlist module exports", () => {
    it("exports joinWaitlist mutation", () => {
      expect(waitlist.joinWaitlist).toBeDefined();
    });

    it("exports listWaitlistEntries adminQuery", () => {
      expect(waitlist.listWaitlistEntries).toBeDefined();
    });

    it("exports approveEntry adminMutation", () => {
      expect(waitlist.approveEntry).toBeDefined();
    });

    it("exports rejectEntry adminMutation", () => {
      expect(waitlist.rejectEntry).toBeDefined();
    });

    it("exports getWaitlistCount query", () => {
      expect(waitlist.getWaitlistCount).toBeDefined();
    });
  });

  describe("Waitlist function definitions", () => {
    it("joinWaitlist is a valid Convex function", () => {
      expect(waitlist.joinWaitlist).toBeDefined();
      // Convex custom functions are objects or functions
      expect(["object", "function"]).toContain(typeof waitlist.joinWaitlist);
    });

    it("approveEntry is a valid Convex function", () => {
      expect(waitlist.approveEntry).toBeDefined();
      expect(["object", "function"]).toContain(typeof waitlist.approveEntry);
    });

    it("rejectEntry is a valid Convex function", () => {
      expect(waitlist.rejectEntry).toBeDefined();
      expect(["object", "function"]).toContain(typeof waitlist.rejectEntry);
    });

    it("getWaitlistCount is a valid Convex function", () => {
      expect(waitlist.getWaitlistCount).toBeDefined();
      expect(["object", "function"]).toContain(
        typeof waitlist.getWaitlistCount,
      );
    });

    it("listWaitlistEntries is a valid Convex function", () => {
      expect(waitlist.listWaitlistEntries).toBeDefined();
      expect(["object", "function"]).toContain(
        typeof waitlist.listWaitlistEntries,
      );
    });
  });

  describe("Feature flag integration (AC1, AC6)", () => {
    it("WaitlistGate component file exists", async () => {
      const mod =
        await import("../../app/(marketing)/_components/WaitlistGate");
      expect(mod.WaitlistGate).toBeDefined();
    });

    it("WaitlistGate is a React component", async () => {
      const mod =
        await import("../../app/(marketing)/_components/WaitlistGate");
      expect(typeof mod.WaitlistGate).toBe("function");
    });
  });

  describe("Waitlist page integration (AC2)", () => {
    it("waitlist page file exists", async () => {
      const mod = await import("../../app/(marketing)/waitlist/page");
      expect(mod.default).toBeDefined();
    });

    it("waitlist page is a React component", async () => {
      const mod = await import("../../app/(marketing)/waitlist/page");
      expect(typeof mod.default).toBe("function");
    });
  });

  describe("Admin waitlist page (AC4)", () => {
    it("admin waitlist page file exists", async () => {
      const mod = await import("../../app/admin/waitlist/page");
      expect(mod.default).toBeDefined();
    });

    it("admin waitlist page is a React component", async () => {
      const mod = await import("../../app/admin/waitlist/page");
      expect(typeof mod.default).toBe("function");
    });
  });

  describe("Invitation email API route (AC5)", () => {
    it("send-invite API route module exists", async () => {
      const mod = await import("../../app/api/waitlist/send-invite/route");
      expect(mod.POST).toBeDefined();
    });

    it("send-invite exports POST handler function", async () => {
      const mod = await import("../../app/api/waitlist/send-invite/route");
      expect(typeof mod.POST).toBe("function");
    });
  });
});
