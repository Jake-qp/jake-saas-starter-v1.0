/**
 * Notification type definitions shared between frontend and backend.
 */

export const NOTIFICATION_TYPES = {
  invite_sent: {
    label: "Team Invitations",
    description: "When someone invites you to a team",
    defaultEmail: true,
    defaultInApp: true,
  },
  invite_accepted: {
    label: "Invite Accepted",
    description: "When someone accepts your team invitation",
    defaultEmail: true,
    defaultInApp: true,
  },
  subscription_changed: {
    label: "Subscription Changes",
    description: "When your team subscription is upgraded or changed",
    defaultEmail: true,
    defaultInApp: true,
  },
  payment_failed: {
    label: "Payment Failures",
    description: "When a payment fails for your team",
    defaultEmail: true,
    defaultInApp: true,
  },
  payment_received: {
    label: "Payment Received",
    description: "When a payment is successfully processed",
    defaultEmail: true,
    defaultInApp: true,
  },
  approaching_limit: {
    label: "Usage Limits",
    description: "When your team approaches a usage limit (80%)",
    defaultEmail: true,
    defaultInApp: true,
  },
  member_removed: {
    label: "Member Removed",
    description: "When you are removed from a team",
    defaultEmail: true,
    defaultInApp: true,
  },
  welcome: {
    label: "Welcome",
    description: "Welcome email when you first sign up",
    defaultEmail: true,
    defaultInApp: false,
  },
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

export const ALL_NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_TYPES,
) as NotificationType[];

/**
 * Generate default preferences for a new user.
 * Each notification type gets its default email + inApp settings.
 */
export function getDefaultPreferences(): Record<
  NotificationType,
  { email: boolean; inApp: boolean }
> {
  return Object.fromEntries(
    ALL_NOTIFICATION_TYPES.map((type) => [
      type,
      {
        email: NOTIFICATION_TYPES[type].defaultEmail,
        inApp: NOTIFICATION_TYPES[type].defaultInApp,
      },
    ]),
  ) as Record<NotificationType, { email: boolean; inApp: boolean }>;
}

/**
 * Build a notification title and body for a given type and metadata.
 * Used by the backend to create in-app notification records.
 */
export function buildNotificationMessage(
  type: NotificationType,
  metadata: Record<string, unknown>,
): { title: string; body: string } {
  switch (type) {
    case "welcome":
      return {
        title: "Welcome to YourApp!",
        body: `Welcome${metadata.userName ? `, ${String(metadata.userName)}` : ""}! Your account is ready.`,
      };
    case "invite_sent":
      return {
        title: "Team Invitation",
        body: `${String(metadata.inviterName ?? "Someone")} invited you to join ${String(metadata.teamName ?? "a team")}`,
      };
    case "invite_accepted":
      return {
        title: "Invite Accepted",
        body: `${String(metadata.memberName ?? "A member")} accepted the invitation to ${String(metadata.teamName ?? "your team")}`,
      };
    case "subscription_changed":
      return {
        title: "Subscription Changed",
        body: `${String(metadata.teamName ?? "Your team")} subscription changed to ${String(metadata.newTier ?? "a new plan")}`,
      };
    case "payment_failed":
      return {
        title: "Payment Failed",
        body: `Payment of ${String(metadata.amount ?? "your subscription")} failed for ${String(metadata.teamName ?? "your team")}`,
      };
    case "payment_received":
      return {
        title: "Payment Received",
        body: `Payment of ${String(metadata.amount ?? "your subscription")} received for ${String(metadata.teamName ?? "your team")}`,
      };
    case "approaching_limit":
      return {
        title: "Usage Alert",
        body: `${String(metadata.teamName ?? "Your team")} has used ${String(metadata.percentUsed ?? "80")}% of ${String(metadata.limitName ?? "the limit")}`,
      };
    case "member_removed":
      return {
        title: "Team Membership Update",
        body: `You have been removed from ${String(metadata.teamName ?? "a team")}`,
      };
    default: {
      const _exhaustive: never = type;
      return { title: "Notification", body: "You have a new notification" };
    }
  }
}
