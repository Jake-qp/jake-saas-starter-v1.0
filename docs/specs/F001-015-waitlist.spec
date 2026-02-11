# Feature: Waitlist / Pre-Launch Mode (F001-015)

## User Context
- **Primary User:** SaaS operator launching a new product; end-users submitting their email to join the waitlist
- **Context:** Desktop/mobile browser, public page accessible to unauthenticated visitors
- **Top Goals:**
  1. Collect emails from interested users before launch
  2. Review and approve/reject waitlist entries from admin panel
  3. Send invitation emails to approved users
- **Mental Model:** A gated pre-launch experience — when enabled, visitors see a waitlist instead of the landing page; admins manage who gets in
- **Key Questions:** How many people are on the waitlist? Who's been approved? How do I let people in?

## PRD Anchor (Source of Truth)
**Feature:** F001-015
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-015 -->/,/<!-- END_FEATURE: F001-015 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

## Feature Outline (Approved)

### Screens
1. **Waitlist Page** (`/waitlist`) — Public page with email collection form, shown when `waitlist_mode` flag is enabled
2. **Admin Waitlist Section** (`/admin/waitlist`) — Admin panel page to review, approve, or reject pending entries

### Key User Flows
1. Visitor navigates to `/` → `waitlist_mode` flag is on → redirected to `/waitlist` → submits email → sees "You're on the waitlist" confirmation
2. Visitor submits duplicate email → sees "already on waitlist" message
3. Admin opens `/admin/waitlist` → sees pending entries → approves entry → approved user receives invitation email
4. Admin rejects entry → entry marked as rejected
5. `waitlist_mode` flag is disabled → app functions normally (landing page visible, no redirect)

### Out of Scope
- Self-service waitlist position checking
- Referral/priority queue system
- Automatic approval rules
- Custom invitation email editing

## User Story
As a SaaS operator
I want to gate access to my product behind a waitlist
So that I can control the onboarding pace during pre-launch

## Acceptance Criteria
- [ ] AC1: When `waitlist_mode` feature flag is enabled, unauthenticated users see `/waitlist` instead of landing page
- [ ] AC2: Waitlist form accepts email and stores in `waitlistEntries` with status "pending"
- [ ] AC3: Duplicate email submission shows "already on waitlist" message
- [ ] AC4: Admin panel shows pending waitlist entries with approve/reject actions
- [ ] AC5: Approved users receive invitation email via Resend
- [ ] AC6: When `waitlist_mode` flag is disabled, app functions normally (landing page visible)

## Edge Cases
- **Duplicate email:** Shows friendly "already on waitlist" message (AC3)
- **Empty email / invalid format:** Client-side Zod validation prevents submission
- **Flag disabled mid-session:** Visitor on `/waitlist` page can still submit (no harm), but new visitors see landing page
- **Resend API key not configured:** Email send fails gracefully (entry still approved), logged to console
- **Super admin visits with flag on:** Admin routes still accessible (only marketing routes redirect)

## Success Definition
We'll know this works when: a SaaS operator can enable `waitlist_mode`, visitors land on a waitlist page, admins can approve entries, and approved users receive invitation emails.
