# Feature: Enhanced RBAC (F001-004)

## User Context
- **Primary User:** Team admin managing team members and permissions
- **Context:** Desktop, team settings page
- **Top Goals:**
  1. Manage team members with granular permissions (Owner/Admin/Member)
  2. Transfer team ownership safely with confirmation
  3. Manage invites (revoke, resend, auto-expire)
- **Mental Model:** "I own this team, I should control who can do what"
- **Key Questions:** Who has what role? Are there pending invites? How do I transfer ownership?

## Feature Outline (Approved)

### Screens
1. **Members Settings Page** — Enhanced with Owner role display, ownership transfer button, resend invite action
2. **Ownership Transfer Dialog** — Confirmation dialog for transferring ownership to another member
3. **Custom Roles Section** — Enterprise-tier feature for creating custom roles (card/section in members page)

### Key User Flows
1. **View Members:** Admin opens settings → Members tab → sees all members with roles (Owner/Admin/Member), pending invites with age
2. **Transfer Ownership:** Owner clicks "Transfer Ownership" → selects member → confirms → ownership transfers, email sent to both
3. **Manage Invites:** Admin sees pending invites → revoke stale ones, resend expired ones; invites auto-expire after 7 days

### Out of Scope
- SSO integration (Enterprise feature, separate module)
- Audit log UI (F001-010 Super Admin Panel)
- Fine-grained per-resource permissions (beyond team-level RBAC)

## User Story
As a team owner/admin
I want granular role-based access control with Owner, Admin, and Member roles
So that I can manage team permissions, transfer ownership, and control invites

## Acceptance Criteria
- [x] AC1: Owner role exists and can perform all actions
- [x] AC2: Owner cannot leave team without transferring ownership
- [x] AC3: New permissions are enforceable via existing viewerHasPermissionX API
- [x] AC4: Custom roles can be created on Enterprise tier
- [x] AC5: Ownership transfer: Owner can transfer to any existing team member via confirmation dialog
- [x] AC6: Ownership transfer triggers email notification to both old and new owner
- [x] AC7: Invites expire after 7 days (auto-deleted via scheduled function)
- [x] AC8: Admin can revoke pending invites and resend expired invites
- [x] AC9: Invite sending is rate-limited (via `@convex-dev/rate-limiter`)
- [x] AC10: Team avatar can be uploaded and displays in sidebar and invite pages

## Edge Cases
- Owner tries to leave team: Must transfer ownership first
- Owner tries to delete own account: Must transfer ownership of all owned teams first
- Last admin tries to change their role: Blocked
- Invite for email that's already a member: Blocked
- Custom role creation on non-Enterprise tier: Blocked with upgrade prompt
- Transfer ownership to self: No-op
- Resend invite that was already accepted: Blocked

## Success Definition
We'll know this works when: Teams have clear Owner/Admin/Member hierarchy, ownership can be transferred safely, invites auto-expire and can be managed, and custom roles are gated to Enterprise tier.
