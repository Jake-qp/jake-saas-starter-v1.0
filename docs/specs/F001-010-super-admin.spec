# Feature: Super Admin Panel (F001-010)

## User Context
- **Primary User:** Platform operator / super admin
- **Context:** Desktop browser, managing the entire SaaS platform
- **Top Goals:**
  1. Monitor platform health (users, teams, revenue metrics)
  2. Manage users/teams and troubleshoot via impersonation
  3. Control feature flags and view analytics
- **Mental Model:** A god-mode dashboard for platform operations
- **Key Questions:** How many users today? Any billing issues? What needs attention?

## PRD Anchor (Source of Truth)
**Feature:** F001-010
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-010 -->/,/<!-- END_FEATURE: F001-010 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

## Feature Outline (Approved)

### Screens
1. **Admin Dashboard** (`/admin`) — User, team, and revenue metrics at a glance
2. **Users Page** (`/admin/users`) — List all users, search, impersonate
3. **Teams Page** (`/admin/teams`) — List all teams with billing tier, member count
4. **Feature Flags** (`/admin/flags`) — Already exists (F001-008), proxies PostHog
5. **Analytics** (`/admin/analytics`) — Links to PostHog dashboard (no custom charts)
6. **Audit Log** (`/admin/audit`) — View admin action log

### Key User Flows
1. Admin opens `/admin` → sees dashboard metrics → clicks into users/teams
2. Admin navigates to `/admin/users` → searches for user → clicks "View as User" → sees ImpersonationBanner → exits impersonation
3. Admin checks `/admin/audit` → sees all impersonation start/stop events

### Out of Scope
- Waitlist management (F001-015 separate feature)
- Custom analytics charts (PostHog does this)
- User creation/deletion from admin (users self-register)

## User Story
As a platform operator (super admin)
I want to manage users, teams, and platform settings from an admin panel
So that I can monitor platform health and troubleshoot user issues

## Acceptance Criteria
- [ ] AC1: Super admin can access /admin routes
- [ ] AC2: Non-super-admin users are blocked from /admin
- [ ] AC3: Dashboard shows user, team, and revenue metrics
- [ ] AC4: Admin actions are logged to auditLog table (Convex-native)
- [ ] AC5: Feature flag management at `/admin/flags` proxies PostHog REST API (EXISTING)
- [ ] AC6: Analytics page links to PostHog dashboard (no custom charts)
- [ ] AC7: Admin can impersonate any user via "View as User" button in user list
- [ ] AC8: Impersonation shows `<ImpersonationBanner>`: "Viewing as [Name] — Exit"
- [ ] AC9: Impersonation is read-only (mutations blocked or flagged)
- [ ] AC10: Impersonation auto-expires after 30 minutes
- [ ] AC11: Every impersonation start/stop is logged to auditLog

## Edge Cases
- Super admin tries to impersonate themselves: Denied with friendly message
- Impersonation session expires mid-use: Banner disappears, user returned to admin view
- No PostHog configured: Feature flags shows "PostHog not configured" (graceful degradation)
- No users in system: Empty state shown
- Non-admin navigates directly to /admin URL: Blocked with "Access Denied" empty state

## Success Definition
We'll know this works when: A super admin can view platform metrics, browse users, impersonate a user (read-only, auto-expiring), and see complete audit trail of all admin actions.
