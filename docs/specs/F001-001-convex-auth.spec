# Feature: Convex Auth Migration + Magic Link (F001-001)

## PRD Anchor (Source of Truth)
**Feature:** F001-001
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-001 -->/,/<!-- END_FEATURE: F001-001 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

<!-- ⚠️ DO NOT INVENT REQUIREMENTS. Re-extract from PRD when needed. -->

## User Context
- **Primary User:** SaaS boilerplate developer integrating auth into their product
- **Context:** Desktop development, configuring auth for their SaaS app
- **Top Goals:**
  1. Email/password sign-in and sign-up that works out of the box
  2. Magic link sign-in via Resend OTP as an alternative auth method
  3. Session management and user preferences (timezone)
- **Mental Model:** Standard SaaS auth — sign up, sign in, manage account, sign out
- **Key Questions:** Am I signed in? What's my account? How do I manage sessions?

## Feature Outline (Approved via PRD)

### Screens
1. **Sign In** - Email/password form + "Sign in with email link" button
2. **Sign Up** - Email/password registration form
3. **Forgot Password** - Password reset via magic link
4. **Profile Settings** - View/edit profile, timezone preference, active sessions

### Key User Flows
1. **Sign Up:** User visits /auth/sign-up → fills email/password → account created → personal team auto-created → redirected to dashboard
2. **Sign In (password):** User visits /auth/sign-in → fills email/password → authenticated → redirected to dashboard
3. **Sign In (magic link):** User visits /auth/sign-in → enters email → clicks "Sign in with email link" → receives OTP email → enters code → authenticated
4. **Forgot Password:** User clicks "Forgot password?" → enters email → receives reset code → enters new password → password updated
5. **Session Management:** User visits profile → sees active sessions → can "Log out all other devices"
6. **Timezone:** User visits profile → selects timezone from dropdown → dates render in selected timezone

### Out of Scope
- OAuth providers (Google, GitHub, etc.) — future enhancement
- Account deletion UI (handled by team deletion in existing flow)
- Onboarding wizard (F001-007)
- Email verification during sign-up (not in PRD ACs)

## User Story
As a SaaS app user
I want to sign in with email/password or magic link
So that I can securely access my team workspace

## Acceptance Criteria
- [x] AC1: User can sign up with email/password and is redirected to dashboard
- [x] AC2: User can sign in with existing email/password and is redirected to dashboard
- [x] AC3: User can sign in via magic link (Resend OTP) — receives branded email, clicks link, is authenticated
- [x] AC4: Sign-in page shows both options: email/password form and "Sign in with email link" button
- [x] AC5: `afterUserCreatedOrUpdated` callback auto-creates personal team on first sign-up
- [x] AC6: User can reset password via forgot-password flow
- [x] AC7: Existing team/member/invite flows work identically after migration
- [x] AC8: No Clerk dependencies remain in package.json or codebase
- [x] AC9: User can view active sessions (device, last active timestamp) in profile settings
- [x] AC10: User can "Log out all other devices" (invalidates all sessions except current)
- [x] AC11: User can set timezone preference (IANA timezone dropdown in profile settings)
- [x] AC12: Dates throughout the app render in the user's selected timezone

## Edge Cases
- User tries to sign up with existing email: Show "account exists, try signing in" message
- Magic link code expired: Show expiration message, allow resend
- Invalid password (too short): Show validation error before submit
- User has no personal team (data inconsistency): Create one on next login via callback
- Multiple rapid sign-in attempts: Convex Auth built-in rate limiting handles this
- Browser without cookies: ConvexAuthNextjsServerProvider handles fallback

## Technical Notes (from PRD Implementation Notes)
- Replace Clerk with Convex Auth (two-layer provider pattern)
- Add Password + ResendOTP providers
- New auth pages (sign-in with email/password + magic link, sign-up, forgot-password)
- `afterUserCreatedOrUpdated` callback for auto personal team creation
- `createRouteMatcher` middleware for route protection
- Update ConvexClientProvider, middleware, user store
- Session management: query `authSessions` table, "Active sessions" list, "Log out all devices"
- Timezone preference: `user.timezone` field (IANA), dropdown in profile settings
- Verify all existing flows work with new auth

## Success Definition
We'll know this works when: A user can sign up, sign in (both methods), manage sessions, and all existing team/member flows continue to work without Clerk.
