import {
  defineEnt,
  defineEntFromTable,
  defineEntSchema,
  getEntDefinitions,
} from "convex-ents";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { vPermission, vRole } from "./permissions";

// Example: 7 day soft deletion period for teams
const TEAM_DELETION_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

const schema = defineEntSchema(
  {
    teams: defineEnt({
      name: v.string(),
      isPersonal: v.boolean(),
      // Billing fields (F001-003)
      polarCustomerId: v.optional(v.string()),
      subscriptionTier: v.optional(v.string()),
      subscriptionStatus: v.optional(v.string()),
      // Avatar storage (F001-017)
      avatarStorageId: v.optional(v.id("_storage")),
    })
      .field("slug", v.string(), { unique: true })
      .index("polarCustomerId", ["polarCustomerId"])
      .edges("messages", { ref: true })
      .edges("members", { ref: true })
      .edges("invites", { ref: true })
      .edges("aiUsage", { ref: true })
      .edges("aiMessages", { ref: true })
      .edges("files", { ref: true })
      .edges("notes", { ref: true })
      .edges("customRoles", { ref: true })
      .deletion("scheduled", { delayMs: TEAM_DELETION_DELAY_MS }),

    // Users table: merges Convex Auth required fields with app-specific fields.
    // Convex Auth requires: name, image, email, emailVerificationTime,
    // phone, phoneVerificationTime, isAnonymous (all optional).
    // App fields: fullName, firstName, lastName, pictureUrl, timezone.
    // tokenIdentifier removed — Convex Auth uses session-based auth via getAuthUserId().
    users: defineEnt({
      // Convex Auth required fields
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      // App-specific fields
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      fullName: v.optional(v.string()),
      pictureUrl: v.optional(v.string()),
      timezone: v.optional(v.string()),
      // Avatar storage (F001-017)
      avatarStorageId: v.optional(v.id("_storage")),
      // Super admin flag (F001-008)
      isSuperAdmin: v.optional(v.boolean()),
      // Onboarding tracking (F001-007)
      onboardingStatus: v.optional(v.string()), // "in_progress" | "completed" | "skipped" (undefined = new user)
      onboardingStep: v.optional(v.number()), // 0-indexed current step
    })
      .field("email", v.optional(v.string()))
      .index("email", ["email"])
      .index("phone", ["phone"])
      .edges("members", { ref: true, deletion: "soft" })
      .deletion("soft"),

    members: defineEnt({
      searchable: v.string(),
    })
      .edge("team")
      .edge("user")
      .edge("role")
      .index("teamUser", ["teamId", "userId"])
      .searchIndex("searchable", {
        searchField: "searchable",
        filterFields: ["teamId"],
      })
      .edges("messages", { ref: true })
      .deletion("soft"),

    invites: defineEnt({
      inviterEmail: v.string(),
    })
      .field("email", v.string(), { unique: true })
      .edge("team")
      .edge("role"),

    roles: defineEnt({
      isDefault: v.boolean(),
    })
      .field("name", vRole, { unique: true })
      .edges("permissions")
      .edges("members", { ref: true })
      .edges("invites", { ref: true }),

    permissions: defineEnt({})
      .field("name", vPermission, { unique: true })
      .edges("roles"),

    // Custom roles for Enterprise tier (F001-004)
    customRoles: defineEnt({
      name: v.string(),
      description: v.optional(v.string()),
      permissionNames: v.array(vPermission),
    })
      .edge("team")
      .index("teamName", ["teamId", "name"]),

    messages: defineEnt({
      text: v.string(),
    })
      .edge("team")
      .edge("member"),

    // File storage tracking (F001-017)
    files: defineEnt({
      storageId: v.id("_storage"),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.number(),
      uploadedBy: v.id("users"),
      purpose: v.string(), // "avatar" | "teamAvatar" | "attachment"
    })
      .edge("team")
      .index("teamPurpose", ["teamId", "purpose"])
      .index("uploadedBy", ["uploadedBy"]),

    // Notes CRUD (F001-011)
    notes: defineEnt({
      title: v.string(),
      content: v.string(),
      searchable: v.string(), // title + " " + content for full-text search
      createdBy: v.id("users"),
      attachmentStorageIds: v.array(v.id("_storage")),
    })
      .edge("team")
      .searchIndex("searchable", {
        searchField: "searchable",
        filterFields: ["teamId"],
      })
      .index("teamCreatedBy", ["teamId", "createdBy"])
      .deletion("soft"),

    // AI chat messages (F001-005)
    aiMessages: defineEnt({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      model: v.optional(v.string()),
    })
      .edge("team")
      .index("teamCreation", ["teamId"]),

    // In-app notifications (F001-006)
    notifications: defineEnt({
      userId: v.id("users"),
      type: v.string(), // NotificationType from lib/notificationTypes.ts
      title: v.string(),
      body: v.string(),
      isRead: v.boolean(),
      metadata: v.optional(v.any()), // type-specific data (teamId, amount, etc.)
    })
      .index("userId", ["userId"])
      .index("userIdRead", ["userId", "isRead"]),

    // Notification preferences per user (F001-006)
    notificationPreferences: defineEnt({
      userId: v.id("users"),
      // JSON object: { [NotificationType]: { email: boolean, inApp: boolean } }
      preferences: v.any(),
    })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
      .index("userId", ["userId"]),

    // AI usage tracking for credit-based billing (F001-003)
    aiUsage: defineEnt({
      model: v.string(),
      creditsUsed: v.number(),
      tokenCount: v.number(),
      timestamp: v.number(),
    })
      .edge("team")
      .index("teamTimestamp", ["teamId", "timestamp"]),

    // Convex Auth tables (converted from standard defineTable to ent format)
    authSessions: defineEntFromTable(
      defineTable({
        userId: v.id("users"),
        expirationTime: v.number(),
      }).index("userId", ["userId"]),
    ),

    authAccounts: defineEntFromTable(
      defineTable({
        userId: v.id("users"),
        provider: v.string(),
        providerAccountId: v.string(),
        secret: v.optional(v.string()),
        emailVerified: v.optional(v.string()),
        phoneVerified: v.optional(v.string()),
      })
        .index("userIdAndProvider", ["userId", "provider"])
        .index("providerAndAccountId", ["provider", "providerAccountId"]),
    ),

    authRefreshTokens: defineEntFromTable(
      defineTable({
        sessionId: v.id("authSessions"),
        expirationTime: v.number(),
        firstUsedTime: v.optional(v.number()),
        parentRefreshTokenId: v.optional(v.id("authRefreshTokens")),
      })
        .index("sessionId", ["sessionId"])
        .index("sessionIdAndParentRefreshTokenId", [
          "sessionId",
          "parentRefreshTokenId",
        ]),
    ),

    authVerificationCodes: defineEntFromTable(
      defineTable({
        accountId: v.id("authAccounts"),
        provider: v.string(),
        code: v.string(),
        expirationTime: v.number(),
        verifier: v.optional(v.string()),
        emailVerified: v.optional(v.string()),
        phoneVerified: v.optional(v.string()),
      })
        .index("accountId", ["accountId"])
        .index("code", ["code"]),
    ),

    authVerifiers: defineEntFromTable(
      defineTable({
        sessionId: v.optional(v.id("authSessions")),
        signature: v.optional(v.string()),
      }).index("signature", ["signature"]),
    ),

    authRateLimits: defineEntFromTable(
      defineTable({
        identifier: v.string(),
        lastAttemptTime: v.number(),
        attemptsLeft: v.number(),
      }).index("identifier", ["identifier"]),
    ),

    as: defineEnt({ ["b"]: v.any() }).index("b", ["b"]),
  },
  { schemaValidation: false },
);

export default schema;

export const entDefinitions = getEntDefinitions(schema);
