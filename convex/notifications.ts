import { v } from "convex/values";
import { query, mutation, internalMutation } from "./functions";
import {
  ALL_NOTIFICATION_TYPES,
  getDefaultPreferences,
  buildNotificationMessage,
  type NotificationType,
} from "../lib/notificationTypes";

/**
 * List notifications for the current user.
 * Returns most recent 20 notifications, ordered by creation time (newest first).
 */
export const list = query({
  args: {},
  async handler(ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return [];
    const userId = ctx.viewerX()._id;
    const notifications = await ctx
      .table("notifications", "userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
    return notifications.map((n) => ({
      _id: n._id,
      _creationTime: n._creationTime,
      type: n.type,
      title: n.title,
      body: n.body,
      isRead: n.isRead,
    }));
  },
});

/**
 * Count unread notifications for the current user.
 */
export const unreadCount = query({
  args: {},
  async handler(ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return 0;
    const userId = ctx.viewerX()._id;
    const unread = await ctx.table("notifications", "userIdRead", (q) =>
      q.eq("userId", userId).eq("isRead", false),
    );
    return unread.length;
  },
});

/**
 * Mark a notification as read.
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  async handler(ctx, { notificationId }) {
    ctx.viewerX();
    const notification = await ctx.table("notifications").getX(notificationId);
    // Only the notification owner can mark it as read
    if (notification.userId !== ctx.viewerX()._id) {
      throw new Error("Not authorized to modify this notification");
    }
    await notification.patch({ isRead: true });
  },
});

/**
 * Mark all notifications as read for the current user.
 */
export const markAllAsRead = mutation({
  args: {},
  async handler(ctx) {
    const userId = ctx.viewerX()._id;
    const unread = await ctx.table("notifications", "userIdRead", (q) =>
      q.eq("userId", userId).eq("isRead", false),
    );
    for (const notification of unread) {
      await notification.patch({ isRead: true });
    }
  },
});

/**
 * Get notification preferences for the current user.
 * Returns default preferences if none saved yet.
 */
export const getPreferences = query({
  args: {},
  async handler(ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return getDefaultPreferences();
    const userId = ctx.viewerX()._id;
    const prefs = await ctx
      .table("notificationPreferences", "userId", (q) => q.eq("userId", userId))
      .unique();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (prefs === null) return getDefaultPreferences();
    return prefs.preferences as Record<
      NotificationType,
      { email: boolean; inApp: boolean }
    >;
  },
});

/**
 * Update notification preferences for the current user.
 */
export const updatePreferences = mutation({
  args: {
    preferences: v.any(),
  },
  async handler(ctx, { preferences }) {
    const userId = ctx.viewerX()._id;
    const existing = await ctx
      .table("notificationPreferences", "userId", (q) => q.eq("userId", userId))
      .unique();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (existing === null) {
      await ctx.table("notificationPreferences").insert({
        userId,
        preferences,
      });
    } else {
      await existing.patch({ preferences });
    }
  },
});

/**
 * Internal mutation to create a notification.
 * Called by backend event handlers (webhooks, mutations, etc.).
 * Checks user preferences before creating in-app notification.
 */
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    metadata: v.optional(v.any()),
  },
  async handler(ctx, { userId, type, metadata }) {
    const notificationType = type as NotificationType;

    // Validate notification type
    if (!ALL_NOTIFICATION_TYPES.includes(notificationType)) {
      console.error(`Unknown notification type: ${type}`);
      return;
    }

    // Check user preferences for in-app channel
    const prefs = await ctx
      .table("notificationPreferences", "userId", (q) => q.eq("userId", userId))
      .unique();

    const defaults = getDefaultPreferences();
    const userPrefs =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      prefs === null
        ? defaults
        : (prefs.preferences as Record<
            NotificationType,
            { email: boolean; inApp: boolean }
          >);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- preferences may not have all types
    const typePref = userPrefs[notificationType] ?? {
      email: true,
      inApp: true,
    };

    // Build notification message from type + metadata
    const { title, body } = buildNotificationMessage(
      notificationType,
      (metadata ?? {}) as Record<string, unknown>,
    );

    // Create in-app notification if enabled
    if (typePref.inApp) {
      await ctx.table("notifications").insert({
        userId,
        type,
        title,
        body,
        isRead: false,
        metadata,
      });
    }

    // Email sending: In production, check typePref.email and call Resend.
    // For now, log the intent (email sending is handled by the email action).
    if (typePref.email) {
      console.log(
        `[Notification] Would send ${type} email to user ${String(userId)}`,
      );
    }
  },
});

/**
 * Internal mutation to send email for a notification.
 * Called as a Convex action to use Resend API.
 * Separated from createNotification so in-app is instant (mutation)
 * while email can be async (action).
 */
export const sendNotificationEmail = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    metadata: v.optional(v.any()),
  },
  async handler(ctx, { userId, type, metadata }) {
    // This is a placeholder for the email action.
    // In production, this would:
    // 1. Look up the user's email
    // 2. Check preferences for email channel
    // 3. Render the React Email template
    // 4. Send via Resend API
    const user = await ctx.table("users").getX(userId);
    console.log(
      `[Email] Would send ${type} email to ${String(user.email)} with metadata:`,
      metadata,
    );
  },
});
