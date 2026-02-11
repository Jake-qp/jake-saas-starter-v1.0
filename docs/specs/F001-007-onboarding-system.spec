# Feature: Onboarding System (F001-007)

## PRD Anchor
**Feature:** F001-007
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-007 -->/,/<!-- END_FEATURE: F001-007 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

## User Context
- **Primary User:** New SaaS user who just signed up
- **Context:** Desktop browser, first session after creating an account
- **Top Goals:**
  1. Quickly set up their profile (name, avatar)
  2. Understand key features of the product
  3. Get to the main app as fast as possible
- **Mental Model:** Linear setup wizard (similar to Notion, Slack onboarding)
- **Key Questions:** "What do I need to do to get started?" "Can I do this later?"

## Feature Outline (Approved)

### Screens
1. **Onboarding Wizard** — Multi-step wizard shown after first sign-up with profile setup, team personalization, and completion steps
2. **Dashboard redirect** — After completion or skip, redirect to team dashboard

### Key User Flows
1. **New user onboarding:** User signs up → redirected to onboarding wizard → completes steps → lands on dashboard
2. **Resume onboarding:** User signs up → starts wizard → leaves (closes tab) → comes back → wizard resumes from last completed step
3. **Skip onboarding:** User signs up → sees wizard → clicks "Skip" → lands on dashboard, wizard marked as skipped

### Out of Scope
- Team invite onboarding (different flow)
- Re-triggering onboarding for existing users
- Onboarding analytics/funnel tracking
- Interactive product tours or tooltips

## User Story
As a newly signed-up user
I want to be guided through initial setup steps
So that I can configure my account and understand the product quickly

## Acceptance Criteria
- [x] AC1: New user sees onboarding wizard after first sign-up
- [x] AC2: Wizard tracks completed steps across sessions
- [x] AC3: User can skip onboarding

## Edge Cases
- User has no name set (email-only signup): Show profile step first, pre-fill from email
- User closes browser mid-onboarding: Resume from last completed step on next visit
- User clears cookies and re-authenticates: Onboarding state persists in database
- User completes all steps: Mark onboarding as done, never show wizard again
- User skips onboarding: Mark as skipped, never show wizard again

## Success Definition
We'll know this works when: A new user who signs up is routed through the onboarding wizard, can complete or skip it, and the wizard state persists across sessions.
