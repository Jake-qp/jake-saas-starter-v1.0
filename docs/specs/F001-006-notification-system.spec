# Feature: Notification System (F001-006)

## PRD Anchor
**Feature:** F001-006
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-006 -->/,/<!-- END_FEATURE: F001-006 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

## User Context
- **Primary User:** Team member (any role) receiving notifications about team activity
- **Context:** Desktop web app, checking notifications during work sessions
- **Top Goals:**
  1. See unread notifications at a glance (bell icon with count)
  2. Receive email alerts for critical events (invites, billing, limits)
  3. Control which notifications arrive via email vs in-app
- **Mental Model:** Notifications like Slack/GitHub — bell icon, dropdown, mark as read
- **Key Questions:** "What happened since I last checked?" "Did my invite get accepted?"

## Feature Outline (Approved — Auto from PRD)

### Screens
1. **Notification Bell (header)** — Unread count badge, dropdown with recent notifications
2. **Notification Preferences (settings)** — Toggle email vs in-app per notification type
3. **Email Preview Route (/dev/emails)** — Dev-only route rendering all email templates with sample data

### Key User Flows
1. **View notifications:** User clicks bell → dropdown shows recent notifications with unread indicator → clicking marks as read
2. **Email delivery:** Key event occurs (invite, payment, etc.) → system sends branded email using React Email template
3. **Manage preferences:** User navigates to settings → toggles email/in-app per notification type → preferences saved immediately

### Out of Scope
- Push notifications (mobile/browser)
- Real-time websocket delivery (Convex subscriptions handle real-time)
- Notification grouping/threading
- Rich notification content (links only, no actions in dropdown)

## User Story
As a team member
I want to receive in-app and email notifications for important team events
So that I stay informed about invites, billing changes, and usage limits

## Acceptance Criteria
- [ ] AC1: In-app notification bell shows unread count
- [ ] AC2: Clicking notification marks as read
- [ ] AC3: Email notifications sent for key events (invite, subscription change)
- [ ] AC4: 8+ React Email templates exist: welcome, invite sent, invite accepted, subscription changed, payment failed, payment received, approaching limit, member removed
- [ ] AC5: All emails use shared layout with brand header and footer
- [ ] AC6: Email preview route (`/dev/emails`) renders all templates with sample data (dev only)
- [ ] AC7: Notification preferences allow users to toggle email vs in-app per notification type

## Edge Cases
- User with no notifications: Bell shows no badge, dropdown shows empty state
- High notification volume: Dropdown shows recent 20, older auto-archived
- Email delivery failure: Graceful degradation — log error, don't crash mutation
- Unsubscribed from email: In-app notification still created, email skipped
- New user (no preferences): Default all notification types to enabled (both channels)

## Success Definition
We'll know this works when: A user receives both an in-app notification (visible in bell dropdown) and a branded email when invited to a team, and can disable email notifications from preferences while still seeing in-app ones.
