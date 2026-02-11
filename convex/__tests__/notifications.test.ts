import { describe, expect, it } from "vitest";
import schema from "../schema";
import {
  NOTIFICATION_TYPES,
  ALL_NOTIFICATION_TYPES,
  type NotificationType,
} from "../../lib/notificationTypes";

/**
 * Notification System test suite (F001-006).
 *
 * Tests schema, notification types config, preference defaults,
 * and email template structure.
 */

describe("F001-006: Notification System", () => {
  // ═══ Schema Tests ═══
  describe("schema — notifications table", () => {
    it("should define the notifications table", () => {
      expect(schema.tables.notifications).toBeDefined();
    });

    it("should have userId index on notifications", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = schema.tables.notifications as any;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("userId");
    });

    it("should have userIdRead index for unread queries", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = schema.tables.notifications as any;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("userIdRead");
    });
  });

  describe("schema — notificationPreferences table", () => {
    it("should define the notificationPreferences table", () => {
      expect(schema.tables.notificationPreferences).toBeDefined();
    });

    it("should have userId index on notificationPreferences", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = schema.tables.notificationPreferences as any;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("userId");
    });
  });

  // ═══ Notification Types Config Tests ═══
  describe("notification types config", () => {
    it("should define at least 8 notification types", () => {
      expect(ALL_NOTIFICATION_TYPES.length).toBeGreaterThanOrEqual(8);
    });

    it("should include all required types from PRD", () => {
      const required: NotificationType[] = [
        "welcome",
        "invite_sent",
        "invite_accepted",
        "subscription_changed",
        "payment_failed",
        "payment_received",
        "approaching_limit",
        "member_removed",
      ];
      for (const type of required) {
        expect(ALL_NOTIFICATION_TYPES).toContain(type);
      }
    });

    it("each notification type should have label and description", () => {
      for (const type of ALL_NOTIFICATION_TYPES) {
        const config = NOTIFICATION_TYPES[type];
        expect(config.label).toBeTruthy();
        expect(config.description).toBeTruthy();
      }
    });

    it("each notification type should have default email and inApp settings", () => {
      for (const type of ALL_NOTIFICATION_TYPES) {
        const config = NOTIFICATION_TYPES[type];
        expect(typeof config.defaultEmail).toBe("boolean");
        expect(typeof config.defaultInApp).toBe("boolean");
      }
    });

    it("welcome type should default to email only (no in-app)", () => {
      expect(NOTIFICATION_TYPES.welcome.defaultEmail).toBe(true);
      expect(NOTIFICATION_TYPES.welcome.defaultInApp).toBe(false);
    });

    it("invite_sent should default to both email and in-app", () => {
      expect(NOTIFICATION_TYPES.invite_sent.defaultEmail).toBe(true);
      expect(NOTIFICATION_TYPES.invite_sent.defaultInApp).toBe(true);
    });

    it("payment_failed should default to both email and in-app", () => {
      expect(NOTIFICATION_TYPES.payment_failed.defaultEmail).toBe(true);
      expect(NOTIFICATION_TYPES.payment_failed.defaultInApp).toBe(true);
    });
  });

  // ═══ Default Preference Generation Tests ═══
  describe("default preferences", () => {
    it("should generate default preferences for all types", () => {
      const defaults: Record<string, { email: boolean; inApp: boolean }> = {};
      for (const type of ALL_NOTIFICATION_TYPES) {
        defaults[type] = {
          email: NOTIFICATION_TYPES[type].defaultEmail,
          inApp: NOTIFICATION_TYPES[type].defaultInApp,
        };
      }
      expect(Object.keys(defaults).length).toBe(ALL_NOTIFICATION_TYPES.length);
    });

    it("all non-welcome types should default both channels to true", () => {
      for (const type of ALL_NOTIFICATION_TYPES) {
        if (type === "welcome") continue;
        expect(NOTIFICATION_TYPES[type].defaultEmail).toBe(true);
        expect(NOTIFICATION_TYPES[type].defaultInApp).toBe(true);
      }
    });
  });

  // ═══ Email Template Structure Tests ═══
  describe("email templates", () => {
    it("should have 8 email template files", async () => {
      // Verify imports work (tests that the modules exist and export defaults)
      const templates = await Promise.all([
        import("../../emails/welcome"),
        import("../../emails/invite-sent"),
        import("../../emails/invite-accepted"),
        import("../../emails/subscription-changed"),
        import("../../emails/payment-failed"),
        import("../../emails/payment-received"),
        import("../../emails/approaching-limit"),
        import("../../emails/member-removed"),
      ]);
      expect(templates.length).toBe(8);
      for (const template of templates) {
        expect(template.default).toBeDefined();
      }
    });

    it("shared layout should export EmailLayout component", async () => {
      const layout = await import("../../emails/layout");
      expect(layout.EmailLayout).toBeDefined();
      expect(typeof layout.EmailLayout).toBe("function");
    });
  });

  // ═══ Helper Function Tests ═══
  describe("getDefaultPreferences helper", () => {
    it("should return correct shape", async () => {
      const { getDefaultPreferences } =
        await import("../../lib/notificationTypes");
      const defaults = getDefaultPreferences();
      expect(defaults).toBeDefined();
      for (const type of ALL_NOTIFICATION_TYPES) {
        expect(defaults[type]).toBeDefined();
        expect(typeof defaults[type].email).toBe("boolean");
        expect(typeof defaults[type].inApp).toBe("boolean");
      }
    });
  });

  // ═══ Notification Creation Helpers ═══
  describe("notification message builders", () => {
    it("buildNotificationMessage should create proper title/body for invite_sent", async () => {
      const { buildNotificationMessage } =
        await import("../../lib/notificationTypes");
      const msg = buildNotificationMessage("invite_sent", {
        inviterName: "John",
        teamName: "Acme",
      });
      expect(msg.title).toContain("Invitation");
      expect(msg.body).toContain("John");
      expect(msg.body).toContain("Acme");
    });

    it("buildNotificationMessage should create proper title/body for payment_failed", async () => {
      const { buildNotificationMessage } =
        await import("../../lib/notificationTypes");
      const msg = buildNotificationMessage("payment_failed", {
        teamName: "Acme",
        amount: "$29.00",
      });
      expect(msg.title).toContain("Payment");
      expect(msg.body).toContain("$29.00");
    });

    it("buildNotificationMessage should create proper title/body for approaching_limit", async () => {
      const { buildNotificationMessage } =
        await import("../../lib/notificationTypes");
      const msg = buildNotificationMessage("approaching_limit", {
        teamName: "Acme",
        limitName: "AI Credits",
        percentUsed: 80,
      });
      expect(msg.title).toContain("Usage");
      expect(msg.body).toContain("80%");
    });

    it("buildNotificationMessage should handle all notification types without error", async () => {
      const { buildNotificationMessage } =
        await import("../../lib/notificationTypes");
      for (const type of ALL_NOTIFICATION_TYPES) {
        const msg = buildNotificationMessage(type, {});
        expect(msg.title).toBeTruthy();
        expect(msg.body).toBeTruthy();
      }
    });
  });
});
