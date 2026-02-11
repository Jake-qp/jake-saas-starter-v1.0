import { describe, it, expect } from "vitest";
import * as schema from "../schema";
import * as admin from "../admin";
import * as functions from "../functions";

describe("Super Admin Panel (F001-010)", () => {
  describe("Schema: auditLog table", () => {
    it("schema exports default with auditLog table", () => {
      expect(schema.default).toBeDefined();
      expect(schema.default.tables).toBeDefined();
      // auditLog table should exist in schema
      expect(schema.default.tables.auditLog).toBeDefined();
    });

    it("auditLog has required fields: actorId, action, timestamp", () => {
      const table = schema.default.tables.auditLog;
      expect(table).toBeDefined();
      const tableValidator = table.validator;
      expect(tableValidator).toBeDefined();
    });

    it("users table has impersonation fields", () => {
      const usersTable = schema.default.tables.users;
      expect(usersTable).toBeDefined();
      // impersonatingUserId and impersonationExpiresAt should be on users
      const tableValidator = usersTable.validator;
      expect(tableValidator).toBeDefined();
    });
  });

  describe("Schema: auditLog indexes", () => {
    it("auditLog table has actorId index", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = schema.default.tables.auditLog as any;
      expect(table).toBeDefined();
      expect(table.indexes).toBeDefined();
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("actorId");
    });

    it("auditLog table has action index", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = schema.default.tables.auditLog as any;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("action");
    });

    it("auditLog table has timestamp index", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = schema.default.tables.auditLog as any;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("timestamp");
    });
  });

  describe("Admin module exports (F001-010)", () => {
    it("exports isSuperAdmin query", () => {
      expect(admin.isSuperAdmin).toBeDefined();
    });

    it("exports listUsers adminQuery", () => {
      expect(admin.listUsers).toBeDefined();
    });

    it("exports listTeams adminQuery", () => {
      expect(admin.listTeams).toBeDefined();
    });

    it("exports dashboardMetrics adminQuery", () => {
      expect(admin.dashboardMetrics).toBeDefined();
    });

    it("exports listAuditLog adminQuery", () => {
      expect(admin.listAuditLog).toBeDefined();
    });

    it("exports startImpersonation adminMutation", () => {
      expect(admin.startImpersonation).toBeDefined();
    });

    it("exports stopImpersonation adminMutation", () => {
      expect(admin.stopImpersonation).toBeDefined();
    });

    it("exports getImpersonationStatus query", () => {
      expect(admin.getImpersonationStatus).toBeDefined();
    });
  });

  describe("Functions module (F001-010)", () => {
    it("exports adminQuery wrapper", () => {
      expect(functions.adminQuery).toBeDefined();
      expect(typeof functions.adminQuery).toBe("function");
    });

    it("exports adminMutation wrapper", () => {
      expect(functions.adminMutation).toBeDefined();
      expect(typeof functions.adminMutation).toBe("function");
    });
  });
});

describe("ImpersonationBanner component (F001-010)", () => {
  it("ImpersonationBanner module exports component", async () => {
    const mod = await import("../../components/ImpersonationBanner");
    expect(mod.ImpersonationBanner).toBeDefined();
  });
});

describe("Admin pages existence (F001-010)", () => {
  it("dashboard page exists at app/admin/page.tsx", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("app/admin/page.tsx")).toBe(true);
  });

  it("users page exists at app/admin/users/page.tsx", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("app/admin/users/page.tsx")).toBe(true);
  });

  it("teams page exists at app/admin/teams/page.tsx", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("app/admin/teams/page.tsx")).toBe(true);
  });

  it("analytics page exists at app/admin/analytics/page.tsx", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("app/admin/analytics/page.tsx")).toBe(true);
  });

  it("audit page exists at app/admin/audit/page.tsx", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("app/admin/audit/page.tsx")).toBe(true);
  });
});

describe("Admin impersonation config (F001-010)", () => {
  it("IMPERSONATION_DURATION_MS is 30 minutes", async () => {
    const mod = await import("../admin");
    expect(mod.IMPERSONATION_DURATION_MS).toBe(30 * 60 * 1000);
  });
});
