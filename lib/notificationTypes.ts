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
