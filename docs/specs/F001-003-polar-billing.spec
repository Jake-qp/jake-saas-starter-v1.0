# Feature: Polar Billing + Credits (F001-003)

## User Context
- **Primary User:** Team Admin (the person who manages the team's subscription and billing)
- **Context:** Desktop at office, managing team settings in the SaaS app
- **Top Goals:**
  1. See current plan, usage, and limits at a glance
  2. Upgrade/downgrade subscription seamlessly
  3. Understand credit consumption for AI features
- **Mental Model:** "My team is on a plan. The plan has limits. I can upgrade if we need more."
- **Key Questions:** "What plan are we on? How much have we used? How do I upgrade?"

## Feature Outline (Approved)

### Screens
1. **Billing Settings Page** - Shows current plan, usage meters (members, AI credits), upgrade/manage subscription actions
2. **Checkout Flow** - Polar-hosted checkout redirect for upgrading plans
3. **Customer Portal** - Polar-hosted portal for managing payment methods and invoices

### Key User Flows
1. **View billing status:** Admin opens Settings > Billing → sees current plan, usage meters, and upgrade options
2. **Upgrade plan:** Admin clicks "Upgrade to Pro" → redirected to Polar checkout → subscription created → team tier updated via webhook → billing page reflects new plan
3. **Hit a limit:** Team member performs action → entitlement check fails → user sees clear error with current usage, limit, and upgrade link
4. **AI credit consumption:** AI request pre-checks credits → executes → decrements credits based on model/token cost → usage meter updates

### Out of Scope
- Per-user billing (billing is team-level only)
- Invoice history display (handled by Polar customer portal)
- Custom enterprise pricing negotiations
- Payment method management (handled by Polar customer portal)
- Proration calculations (handled by Polar)
- New RBAC permissions (F001-004 scope — use existing "Manage Team" for billing)

## User Story
As a team admin
I want to manage my team's subscription and see usage against plan limits
So that I can ensure my team has the resources they need and upgrade when necessary

## Acceptance Criteria
- [ ] AC1: Team admin can view billing page with current plan
- [ ] AC2: Polar checkout flow creates subscription and updates team tier
- [ ] AC3: `getUserInfo` returns team-level identity for Polar (team._id + owner email)
- [ ] AC4: Webhook `onSubscriptionUpdated` correctly updates subscriptionTier and subscriptionStatus
- [ ] AC5: Idempotent webhook handling (timestamp-based stale detection via `@convex-dev/polar`)
- [ ] AC6: checkEntitlement correctly enforces member limits per tier
- [ ] AC7: Credit-based entitlement: AI requests decrement credits based on model/token usage
- [ ] AC8: Dashboard shows credit usage meter (used/remaining for current period)
- [ ] AC9: Free tier teams have appropriate feature restrictions

## Edge Cases
- Team with no subscription: Treated as free tier (not an error)
- Webhook arrives late or out of order: `@convex-dev/polar` handles event ID dedup; business logic is idempotent
- Webhook replay: Updating subscriptionTier/status is safe to replay (idempotent patch)
- Team at exactly the limit: Next action that would exceed the limit is blocked with upgrade prompt
- Enterprise with -1 limits: Entitlement check returns immediately (unlimited)
- Credit pre-check passes but actual cost exceeds: Acceptable drift — reconciliation via scheduled job
- Cancellation: Keep current tier until billing period ends
- Multiple admins: Any admin with "Manage Team" permission can manage billing

## Success Definition
We'll know this works when: A team can operate on free tier with proper limits, an admin can upgrade via Polar checkout, the webhook updates the team's tier, entitlement checks enforce per-tier limits, AI credits decrement correctly, and the billing page shows accurate plan + usage information.
