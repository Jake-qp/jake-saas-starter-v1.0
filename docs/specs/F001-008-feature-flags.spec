# Feature: Feature Flags (PostHog) — F001-008

## PRD Anchor (Source of Truth)
**Feature:** F001-008
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-008 -->/,/<!-- END_FEATURE: F001-008 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

## User Context
- **Primary User:** SaaS developer (app admin / super admin)
- **Context:** Desktop, managing feature rollout and experimentation
- **Top Goals:**
  1. Control feature visibility with PostHog feature flags
  2. Manage flags via admin UI without visiting PostHog dashboard
  3. Graceful degradation when PostHog is not configured
- **Mental Model:** Feature flags = toggles that control which features are visible to which users
- **Key Questions:** Which flags are active? What payload does a flag carry?

## Feature Outline (Approved)

### Screens
1. **Admin Flags Management** (`/admin/flags`) — List, create, toggle, and delete feature flags via PostHog API proxy

### Key User Flows
1. Developer uses `useFeatureFlag("key")` in component → returns boolean from PostHog (or `false` if unconfigured)
2. Developer uses `useFeatureFlagWithPayload("key")` → returns JSON payload (or `null` if unconfigured)
3. Super admin visits `/admin/flags` → sees all flags, can create/toggle/delete via proxied PostHog API

### Out of Scope
- A/B testing analytics (that's PostHog dashboard territory)
- Percentage rollouts UI (managed in PostHog directly)
- Server-side flag evaluation (using client-side PostHog SDK only for hooks)
- Custom flag storage in Convex (flags live in PostHog)

## User Story
As a super admin,
I want to manage PostHog feature flags from within the app's admin panel,
So that I don't need to context-switch to the PostHog dashboard for simple flag operations.

As a developer,
I want hooks that wrap PostHog feature flags with graceful degradation,
So that the app works identically with or without PostHog configured.

## Acceptance Criteria
- [ ] AC1: `useFeatureFlag(key)` returns correct boolean value from PostHog
- [ ] AC2: `useFeatureFlag(key)` returns `false` when PostHog is not configured (graceful degradation)
- [ ] AC3: `useFeatureFlagWithPayload(key)` returns JSON payload for flags with payloads
- [ ] AC4: Admin can list, create, toggle, and delete flags via `/admin/flags` (proxies PostHog API)
- [ ] AC5: `POSTHOG_PERSONAL_API_KEY` is never exposed to client-side code
- [ ] AC6: Flag management API routes verify `isSuperAdmin` before proxying

## Edge Cases
- PostHog not configured: All hooks return false/null, admin page shows "PostHog not configured" message
- Invalid flag key: Returns false/null (PostHog default behavior)
- PostHog API error (network): Admin UI shows error toast, hooks continue returning cached values
- Non-super-admin accessing /admin/flags: 403 Forbidden from API routes
- POSTHOG_PERSONAL_API_KEY not set: Admin management UI disabled with clear message

## Technical Design

### Infrastructure
- `isSuperAdmin` boolean field on users table (schema change)
- `adminQuery` / `adminMutation` wrappers in `convex/functions.ts` that enforce isSuperAdmin
- Convex query to check isSuperAdmin for client-side auth guard

### Hooks
- Enhance existing `useFeatureFlag(key)` to properly use PostHog `useFeatureFlagEnabled`
- New `useFeatureFlagWithPayload(key)` hook using PostHog `useFeatureFlagPayload`

### API Routes (Next.js)
- `POST /api/admin/flags` — Create a flag
- `GET /api/admin/flags` — List all flags
- `PATCH /api/admin/flags/[id]` — Toggle a flag (active/inactive)
- `DELETE /api/admin/flags/[id]` — Delete a flag
- All routes verify `isSuperAdmin` via Convex auth before proxying to PostHog

### Admin UI
- `/admin/flags` page using DataTable for flag listing
- Create flag dialog
- Toggle switch per flag
- Delete confirmation dialog

## Success Definition
We'll know this works when:
- Feature flags can be evaluated in any React component with a one-line hook call
- The app works perfectly with PostHog unconfigured (all flags default to false)
- Super admins can manage flags without leaving the app
- The PostHog personal API key never appears in client-side code
