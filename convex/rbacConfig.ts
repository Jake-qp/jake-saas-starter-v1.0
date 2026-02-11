/**
 * RBAC Configuration — single source of truth for role-permission mappings.
 *
 * Used by:
 * - convex/init.ts (seed system roles + permissions)
 * - convex/seedPreview.ts (preview deployment data)
 * - convex/__tests__/rbac.test.ts (test matrix)
 *
 * @see F001-004 Enhanced RBAC
 */

import type { Permission, Role } from "./permissions";

/**
 * All 15 permissions in the system.
 */
export const ALL_PERMISSIONS: Permission[] = [
  // Original V1 permissions
  "Manage Team",
  "Delete Team",
  "Read Members",
  "Manage Members",
  "Contribute",
  // F001-004 new permissions
  "Transfer Ownership",
  "View Billing",
  "Manage Billing",
  "Upload Files",
  "Delete Files",
  "Use AI",
  "View Analytics",
  "Manage Integrations",
  "Invite Members",
  // F001-011: Notes CRUD
  "Manage Content",
];

/**
 * Owner: All permissions (15/15).
 * Only one Owner per team. Can transfer ownership.
 */
export const OWNER_PERMISSIONS: Permission[] = [...ALL_PERMISSIONS];

/**
 * Admin: All except Transfer Ownership and Manage Billing (13/15).
 * Can manage members, invites, files, content, and view billing.
 */
export const ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(
  (p) => p !== "Transfer Ownership" && p !== "Manage Billing",
);

/**
 * Member: Basic access (4/14).
 * Can read members, contribute, upload files, and use AI.
 */
export const MEMBER_PERMISSIONS: Permission[] = [
  "Read Members",
  "Contribute",
  "Upload Files",
  "Use AI",
];

/**
 * Role → Permission mapping for all system roles.
 */
export const ROLE_PERMISSION_MAP: Record<Role, Permission[]> = {
  Owner: OWNER_PERMISSIONS,
  Admin: ADMIN_PERMISSIONS,
  Member: MEMBER_PERMISSIONS,
};

/**
 * Role hierarchy order (highest to lowest privilege).
 */
export const ROLE_HIERARCHY: Role[] = ["Owner", "Admin", "Member"];

/**
 * Default role for new members (via invites).
 */
export const DEFAULT_ROLE: Role = "Member";

/**
 * Invite TTL in milliseconds (7 days).
 */
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
