# PRD: SaaS Boilerplate V2 — Production-Grade Upgrade

> **ID:** F001
> **Status:** Draft
> **Author:** Jake
> **Created:** 2026-02-10
> **Last Updated:** 2026-02-10

---

## Context Summary
<!-- REQUIRED: This section is loaded by /build for child features. Keep under 50 lines. -->

**Vision:** Transform the existing SaaS starter into a world-class, production-grade boilerplate with auth, billing, AI, admin, feature flags, and analytics — all native to Convex.

**Problem:** The current starter has solid multi-tenant foundations but lacks billing, AI integration, admin tooling, feature flags, analytics, and onboarding — making it unsuitable for shipping real products without weeks of additional work.

**Key Decisions:**
- Replace Clerk with Convex Auth (single source of truth, no external auth dependency)
- Auth: Convex Auth with email/password only (no OAuth providers — keeps setup simple)
- Team-level billing via Polar (B2B SaaS model: Slack, Notion, Linear)
- Feature flags stored in Convex (reactive subscriptions = instant propagation)
- AI via Vercel AI SDK with Convex HTTP actions for streaming
- Super admin via `isSuperAdmin` boolean on users (orthogonal to team roles)
- Configurable entitlement system (tiers, limits, feature gates defined in config, not hardcoded)
- Three fixed roles (Owner/Admin/Member) with opt-in custom roles for Enterprise tier

**Schema Changes:**
- `users`: Remove `tokenIdentifier`, add `isSuperAdmin`; integrate `authTables`
- `teams`: Add `polarCustomerId`, `subscriptionTier`, `subscriptionStatus`
- New tables: `notes`, `aiUsage`, `aiConversations`, `aiMessages`, `notifications`, `notificationPreferences`, `onboardingProgress`, `featureFlags`, `teamFeatureFlags`, `analyticsEvents`, `auditLog`

### Child Features

| ID | Name | Priority | Status | Dependencies |
|----|------|----------|--------|--------------|
| F001-001 | Convex Auth Migration | P0 | pending | None |
| F001-002 | Design System Expansion | P0 | pending | None |
| F001-003 | Polar Billing Integration | P1 | pending | F001-001 |
| F001-004 | Enhanced RBAC | P1 | pending | F001-001, F001-003 |
| F001-005 | AI/LLM Integration | P2 | pending | F001-003, F001-004 |
| F001-006 | Notification System | P2 | pending | F001-001, F001-003 |
| F001-007 | Onboarding System | P2 | pending | F001-001, F001-003 |
| F001-008 | Feature Flags | P3 | pending | F001-003 |
| F001-009 | Analytics & Event Tracking | P3 | pending | F001-001 |
| F001-010 | Super Admin Panel | P3 | pending | F001-003, F001-004, F001-008, F001-009 |
| F001-011 | Example App (Notes CRUD) | P2 | pending | F001-001, F001-004, F001-003 |

---

## User Context

### Who Uses This?

| Persona | Role | Context |
|---------|------|---------|
| SaaS Founder | Clones boilerplate to launch product | Needs billing, auth, teams, admin out-of-box |
| Solo Developer | Building side project | Wants fast setup, minimal config, good defaults |
| Dev Team | Building B2B SaaS | Needs RBAC, multi-tenant, billing per team |
| End User (of built product) | Signs up, joins team, uses features | Needs smooth onboarding, reliable auth, clear billing |
| Team Admin | Manages team members, billing, settings | Needs role management, billing dashboard, member invites |
| Super Admin | Platform operator | Needs user/team oversight, feature flag control, analytics |

### Top 3 Goals

1. **Clone and ship** — Developer clones repo, configures env vars, and has a working SaaS with auth + billing + teams in under 30 minutes
2. **Extend without fighting** — Every module is well-documented with clear patterns to follow, modify, or remove
3. **Production-ready defaults** — Security, error handling, rate limiting, and audit logging work out of the box

### Mental Model

Developers think of this as "the last boilerplate I need." It should feel like a curated, opinionated starter that makes the right decisions so they can focus on their product's unique value, not plumbing.

### Glance Questions

- "How do I add billing to my SaaS?" (F001-003)
- "How do I add AI features?" (F001-005)
- "How do I manage who can do what?" (F001-004)
- "How do I see what's happening across my platform?" (F001-010)

---

## Executive Summary

This PRD defines the transformation of an existing SaaS starter kit into a comprehensive, production-grade boilerplate. The current codebase provides multi-tenant foundations (teams, RBAC, invites, soft deletion) built on Next.js 14, Convex, Clerk, and shadcn/ui. It needs to evolve into a complete platform with native auth, billing, AI integration, admin tooling, feature flags, analytics, and onboarding.

The upgrade is structured as 11 independent-but-connected modules, each buildable via the Vibe System's `/build` workflow. The architecture prioritizes Convex-native solutions (auth, feature flags, analytics) over third-party services where possible, reducing external dependencies and leveraging Convex's real-time subscriptions.

**Before:** A starter with auth (Clerk), teams, and basic RBAC. Developers must build billing, AI, admin, notifications, and analytics from scratch.

**After:** A complete SaaS platform with Convex Auth, Polar billing, AI/LLM integration, super admin panel, feature flags, in-app notifications, onboarding wizard, analytics, and a rich example app — all following consistent patterns and ready for customization.

---

## Problem Statement

### The "Last Mile" Problem

SaaS starters get developers 30% of the way. The remaining 70% — billing integration, proper auth flows, admin tooling, AI features, and operational visibility — takes weeks of custom work. Every SaaS needs these same foundational pieces, yet developers rebuild them from scratch each time.

### Root Cause

Existing starters optimize for demo-ability over production-readiness. They show auth and CRUD working but skip the hard parts: webhook handling, rate limiting, entitlement enforcement, admin oversight, and graceful error states.

### User Impact

| Persona | Current Pain | Impact |
|---------|-------------|--------|
| SaaS Founder | Weeks building billing + admin before product work | Delayed launch, wasted effort |
| Developer | Inconsistent patterns, missing pieces | Tech debt from day one |
| End User | No onboarding, poor notifications | Bad first experience |
| Team Admin | No billing visibility, limited role control | Can't self-serve team management |
| Platform Operator | No admin panel, no analytics | Flying blind operationally |

---

## Vision: The Complete SaaS Foundation

A boilerplate where cloning the repo and setting 5 environment variables gives you:
- User auth with email/password via Convex Auth
- Multi-tenant teams with Owner/Admin/Member roles
- Billing per team via Polar with configurable tiers and entitlements
- AI chat with streaming, usage tracking, and rate limiting
- In-app + email notifications
- Guided onboarding for new users and teams
- Feature flags with per-team overrides
- First-party analytics and event tracking
- Super admin panel for platform operations
- A rich example app demonstrating every pattern

---

## Feature Outline (Approved)

### What Changes

| Component | Current State | New State |
|-----------|--------------|-----------|
| Auth | Clerk (`@clerk/nextjs`) | Convex Auth (`@convex-dev/auth`) |
| Auth pages | Clerk hosted/modal | Custom sign-in/sign-up/forgot-password pages (email/password) |
| Middleware | Clerk `authMiddleware` | Simple redirect-based middleware |
| Provider | `ClerkProvider` + `ConvexProviderWithClerk` | `ConvexAuthProvider` |
| User lookup | `tokenIdentifier` from Clerk JWT | Session-based via Convex Auth |
| Billing | None | Polar via `@convex-dev/polar` component |
| Entitlements | None | Configurable tier/limit/feature-gate system |
| Roles | Admin, Member (2) | Owner, Admin, Member (3) + custom roles |
| Permissions | 5 | ~14 |
| AI | None | Vercel AI SDK + Convex HTTP actions |
| Notifications | Invite emails only | In-app (real-time) + email templates |
| Onboarding | None | Multi-step wizard |
| Feature flags | None | Convex-native with per-team overrides |
| Analytics | None | First-party event tracking in Convex |
| Admin | None | Super admin panel (`/admin`) |
| Demo content | Messages (basic chat) | Notes CRUD (rich reference implementation) |
| UI components | 39 shadcn/ui | 49+ shadcn/ui + 8 app-level components |

### Key Flows

1. **New user sign-up:** Landing page > Sign up (email/password) > Personal team created > Onboarding wizard > Dashboard
2. **Team creation + billing:** Create team > Select plan (free/pro/enterprise) > Polar checkout > Team activated with entitlements
3. **AI usage:** Team member opens AI chat > Sends prompt > Streaming response via HTTP action > Usage tracked and decremented from tier quota
4. **Admin oversight:** Super admin logs in > `/admin` dashboard > Views user/team metrics, manages feature flags, reviews audit log

### Out of Scope (This Build)

- Mobile app / React Native
- Multi-language / i18n
- Custom domain per team
- File upload / storage
- Real-time collaboration (beyond Convex subscriptions)
- SSO / SAML / OAuth providers (can be added later)
- Webhook management UI for end users
- Public API with API keys

### Relationship to Other Features

| Feature | Relates To | How |
|---------|-----------|-----|
| Auth (F001-001) | Everything | Foundation — all modules depend on authenticated context |
| Billing (F001-003) | Entitlements, Feature Flags | Tier determines limits and feature access |
| RBAC (F001-004) | All team features | Permissions gate every team action |
| AI (F001-005) | Billing, RBAC | Rate-limited by tier, gated by permission |
| Feature Flags (F001-008) | Admin, Billing | Flags can be tier-based or per-team |
| Analytics (F001-009) | Admin | Admin dashboard surfaces aggregate analytics |
| Admin (F001-010) | Everything | Admin panel aggregates all modules |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14 (App Router)                  │
│                                                              │
│  app/                     app/t/[teamSlug]/   app/admin/     │
│  ├─ auth/sign-in          ├─ dashboard        ├─ dashboard   │
│  ├─ auth/sign-up          ├─ settings/billing  ├─ users      │
│  └─ auth/forgot-password  ├─ settings/members  ├─ teams      │
│                           ├─ notes             ├─ flags      │
│                           └─ ai                └─ analytics  │
│                                                              │
│  ConvexAuthProvider (replaces ClerkProvider)                  │
│  useConvexAuth / useQuery / useMutation / useChat            │
└──────────────────────┬──────────────────────────────────────┘
                       │ Convex React Client
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Convex Backend                           │
│                                                              │
│  convex/                                                     │
│  ├─ auth.ts              (Convex Auth config)                │
│  ├─ schema.ts            (convex-ents + authTables)          │
│  ├─ functions.ts         (query/mutation wrappers)           │
│  ├─ permissions.ts       (RBAC checks)                       │
│  ├─ entitlements.ts      (tier/limit/feature checks)         │
│  ├─ billing.ts           (Polar integration)                 │
│  ├─ http.ts              (HTTP routes: webhooks, AI stream)  │
│  ├─ convex.config.ts     (Polar component registration)      │
│  ├─ users/teams/         (Team CRUD, members, invites)       │
│  ├─ notes/               (Example CRUD app)                  │
│  ├─ ai/                  (AI conversations, usage tracking)  │
│  ├─ notifications/       (In-app + email)                    │
│  ├─ featureFlags/        (Flag definitions + overrides)      │
│  ├─ analytics/           (Event tracking)                    │
│  └─ admin/               (Super admin queries/mutations)     │
│                                                              │
│  Security Layers:                                            │
│  1. Schema: validators, unique constraints, soft deletion    │
│  2. Runtime: viewerX(), viewerHasPermissionX(),              │
│     checkEntitlement(), checkRateLimit()                     │
│  3. Infrastructure: env vars, HMAC webhook verification      │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┼───────────┐
           ▼           ▼           ▼
      Polar API   OpenAI/Claude   Resend
      (Billing)   (AI Providers)  (Email)
```

### Auth Flow (Post-Migration)

```
User visits /auth/sign-in
  → Convex Auth sign-in (email/password)
  → Session created in Convex
  → ConvexAuthProvider detects session
  → Redirect to /t (triggers user store + personal team creation)
  → Redirect to /t/[teamSlug] (dashboard)
```

### Billing Flow

```
Team admin clicks "Upgrade"
  → Redirected to Polar checkout (team.polarCustomerId)
  → User completes payment on Polar
  → Polar fires webhook to convex/http.ts
  → Webhook handler updates team.subscriptionTier + team.subscriptionStatus
  → Entitlement checks (checkEntitlement) now reflect new tier
  → UI reactively updates via Convex subscriptions
```

### Permission Resolution Flow

```
User attempts action (e.g., "Delete Note")
  → viewerWithPermissionX(ctx, teamId, "Manage Content")
  → Looks up member by (teamId, userId)
  → Traverses member → role → permissions edges
  → If "Manage Content" found → allow
  → If not found → throw ConvexError("Viewer does not have permission")
```

---

## Schema Changes

### Modified Tables

#### `users`
```
- REMOVE: tokenIdentifier (Clerk-specific)
- ADD: isSuperAdmin: v.optional(v.boolean())
- Integration with authTables from @convex-dev/auth
```

#### `teams`
```
- ADD: polarCustomerId: v.optional(v.string())
- ADD: subscriptionTier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")))
- ADD: subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due"), v.literal("trialing")))
```

#### `roles`
```
- ADD new role: "Owner"
- EXPAND vRole union to include "Owner"
```

#### `permissions`
```
- ADD: "Manage Billing", "View Billing", "Use AI", "Manage AI Settings",
       "View Analytics", "Manage Integrations", "Manage Feature Flags",
       "Manage Content", "View Content"
- EXPAND vPermission union
```

### New Tables

#### `notes`
```typescript
notes: defineEnt({
  title: v.string(),
  content: v.string(),
  priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  searchable: v.string(),
})
  .edge("team")
  .edge("member")
  .searchIndex("searchable", { searchField: "searchable", filterFields: ["teamId"] })
  .deletion("soft")
```

#### `aiConversations`
```typescript
aiConversations: defineEnt({
  title: v.optional(v.string()),
  model: v.string(),
})
  .edge("team")
  .edge("member")
  .deletion("soft")
```

#### `aiMessages`
```typescript
aiMessages: defineEnt({
  role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  content: v.string(),
  tokenCount: v.optional(v.number()),
})
  .edge("conversation", { to: "aiConversations" })
```

#### `aiUsage`
```typescript
aiUsage: defineEnt({
  tokensUsed: v.number(),
  periodStart: v.number(),
  periodEnd: v.number(),
})
  .edge("team")
  .index("teamPeriod", ["teamId", "periodStart"])
```

#### `notifications`
```typescript
notifications: defineEnt({
  type: v.string(),
  title: v.string(),
  body: v.string(),
  read: v.boolean(),
  actionUrl: v.optional(v.string()),
  metadata: v.optional(v.any()),
})
  .edge("user")
  .index("userRead", ["userId", "read"])
```

#### `notificationPreferences`
```typescript
notificationPreferences: defineEnt({
  emailEnabled: v.boolean(),
  inAppEnabled: v.boolean(),
  types: v.optional(v.any()),
})
  .edge("user")
```

#### `onboardingProgress`
```typescript
onboardingProgress: defineEnt({
  completedSteps: v.array(v.string()),
  currentStep: v.string(),
  data: v.optional(v.any()),
})
  .edge("user")
```

#### `featureFlags`
```typescript
featureFlags: defineEnt({
  key: v.string(),
  description: v.optional(v.string()),
  enabled: v.boolean(),
  tierDefaults: v.optional(v.any()),
})
  .field("key", v.string(), { unique: true })
```

#### `teamFeatureFlags`
```typescript
teamFeatureFlags: defineEnt({
  enabled: v.boolean(),
})
  .edge("team")
  .edge("featureFlag", { to: "featureFlags" })
  .index("teamFlag", ["teamId", "featureFlagId"])
```

#### `analyticsEvents`
```typescript
analyticsEvents: defineEnt({
  event: v.string(),
  properties: v.optional(v.any()),
  timestamp: v.number(),
})
  .edge("team")
  .edge("user")
  .index("teamEvent", ["teamId", "event"])
  .index("eventTimestamp", ["event", "timestamp"])
```

#### `auditLog`
```typescript
auditLog: defineEnt({
  action: v.string(),
  details: v.optional(v.any()),
  targetType: v.optional(v.string()),
  targetId: v.optional(v.string()),
  timestamp: v.number(),
})
  .edge("user")
  .index("action", ["action"])
  .index("userAction", ["userId", "action"])
```

---

## Data Flow

### Entitlement Check Flow
```
1. User action triggers mutation
2. Mutation calls checkEntitlement(ctx, teamId, "aiRequests")
3. checkEntitlement:
   a. Gets team.subscriptionTier (default: "free")
   b. Reads PLAN_CONFIG[tier].aiRequests → limit
   c. Queries aiUsage for current period → used
   d. Returns { allowed: used < limit, used, limit, remaining }
4. If not allowed → throw ConvexError with limit details
5. If allowed → proceed with action, increment usage
```

### Feature Flag Resolution
```
1. Client calls useFeatureFlag("new-dashboard")
2. Query resolves:
   a. Check teamFeatureFlags for team override → if exists, return it
   b. Check featureFlags.tierDefaults[team.subscriptionTier] → if exists, return it
   c. Return featureFlags.enabled (global default)
3. Result reactively updates via Convex subscription
```

### AI Streaming Flow
```
1. Client calls useChat() (Vercel AI SDK)
2. Request hits Convex HTTP action: POST /api/ai/chat
3. HTTP action:
   a. Authenticates user via session token
   b. Checks permission: "Use AI"
   c. Checks entitlement: aiRequests remaining
   d. Checks rate limit: token bucket for team
   e. Creates/updates aiConversation
   f. Calls AI provider via Vercel AI SDK (streamText)
   g. Streams response to client
   h. Schedules mutation to save aiMessage + update aiUsage
4. Client receives streamed tokens via useChat
```

---

## Edge Cases & Error Handling

| # | Scenario | Problem | Risk | Solution |
|---|----------|---------|------|----------|
| 1 | User signs up with email that already exists | Duplicate accounts | Medium | Convex Auth rejects duplicate; show clear error |
| 2 | Polar webhook arrives before team exists | Orphaned subscription | Medium | Webhook handler retries with backoff; log warning if team not found |
| 3 | Team owner leaves or is deleted | Orphaned team with no owner | High | Owner cannot leave; must transfer ownership first |
| 4 | Subscription expires mid-session | User mid-action loses access | Medium | Graceful degradation; show upgrade prompt, don't kill active session |
| 5 | AI provider rate-limited or down | User gets no response | Medium | Return friendly error; suggest retry; log for monitoring |
| 6 | Feature flag changed while user on page | Inconsistent UI state | Low | Convex reactive subscription auto-updates; components re-render |
| 7 | Super admin impersonates deleted user | Access to soft-deleted data | Medium | Impersonation is read-only; soft-deleted users shown with clear indicator |
| 8 | Concurrent role changes on same member | Race condition | Low | Convex transactions are serializable; last write wins |
| 9 | Invite sent to email already on team | Confusion, duplicate member | Medium | Check existing membership before creating invite; show clear error |
| 10 | Email delivery fails during password reset | User can't recover account | Medium | Show retry option; log for monitoring |
| 11 | Billing webhook replay attack | Duplicate subscription updates | High | Polar component handles idempotency via event IDs |
| 12 | AI usage counter drift | User charged more/less than actual | Medium | Reconcile usage counts periodically via scheduled function |
| 13 | Team at member limit tries to accept invite | Exceeds entitlement | Medium | Check entitlement in invite acceptance flow; reject with upgrade prompt |
| 14 | Analytics table grows unbounded | Performance degradation | Medium | TTL-based cleanup via scheduled function (e.g., 90-day retention) |

---

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `convex/auth.ts` | Convex Auth provider config (Password/email) |
| `convex/convex.config.ts` | Component registration (Polar) |
| `convex/http.ts` | HTTP routes (Polar webhooks, AI streaming) |
| `convex/billing.ts` | Polar integration queries/mutations |
| `convex/entitlements.ts` | Tier config + entitlement check functions |
| `convex/rateLimiting.ts` | Token bucket rate limiter |
| `convex/notes/` | Notes CRUD (queries, mutations) |
| `convex/ai/` | AI conversations, messages, usage tracking |
| `convex/notifications/` | Notification create/list/mark-read + preferences |
| `convex/featureFlags/` | Flag CRUD + resolution logic |
| `convex/analytics/` | Event tracking + aggregation queries |
| `convex/admin/` | Super admin queries/mutations + audit log |
| `app/auth/sign-in/page.tsx` | Sign-in page |
| `app/auth/sign-up/page.tsx` | Sign-up page |
| `app/auth/forgot-password/page.tsx` | Password reset page |
| `app/t/[teamSlug]/notes/page.tsx` | Notes list page |
| `app/t/[teamSlug]/ai/page.tsx` | AI chat page |
| `app/t/[teamSlug]/settings/billing/page.tsx` | Billing settings page |
| `app/t/onboarding/page.tsx` | Onboarding wizard |
| `app/admin/` | Super admin panel pages |
| `components/PageHeader.tsx` | Consistent page header with breadcrumbs |
| `components/DataTable.tsx` | Configurable data table |
| `components/EmptyState.tsx` | Standardized empty states |
| `components/StatusBadge.tsx` | Subscription/status indicators |
| `components/PricingCard.tsx` | Plan comparison cards |
| `components/UsageMeter.tsx` | Visual usage bars |
| `components/StepWizard.tsx` | Multi-step form/onboarding |
| `components/ThemeToggle.tsx` | Dark/light/system toggle |
| `lib/planConfig.ts` | Configurable tier/entitlement definitions |

### Modified Files

| File | Changes |
|------|---------|
| `convex/schema.ts` | Add authTables integration, new entities, expand roles/permissions |
| `convex/functions.ts` | Session-based user lookup (replace tokenIdentifier) |
| `convex/permissions.ts` | Add Owner role, 9 new permissions, preserve API surface |
| `convex/init.ts` | Seed new roles, permissions, default feature flags |
| `convex/users.ts` | Update store mutation for Convex Auth identity shape |
| `convex/users/teams.ts` | Add billing fields to team creation |
| `convex/users/teams/members.ts` | Owner role enforcement |
| `convex/invites.ts` | Entitlement check on invite acceptance |
| `app/ConvexClientProvider.tsx` | Replace ClerkProvider with ConvexAuthProvider |
| `app/t/[teamSlug]/hooks.ts` | Add useFeatureFlag, useTrack hooks |
| `app/t/[teamSlug]/layout.tsx` | Add navigation for notes, AI, billing |
| `app/t/TeamMenu.tsx` | Expand navigation items |
| `middleware.ts` | Replace Clerk middleware with redirect logic |
| `package.json` | Add @convex-dev/auth, @convex-dev/polar, ai, @ai-sdk/*, next-themes, react-email |
| `tailwind.config.ts` | Dark mode support |

---

## Implementation Phases

### Phase 1: Foundation (P0)
- [ ] **F001-001:** Convex Auth Migration
  - Replace Clerk with Convex Auth
  - New auth pages (sign-in, sign-up, forgot-password)
  - Update ConvexClientProvider, middleware, user store
  - Verify all existing flows work with new auth
- [ ] **F001-002:** Design System Expansion
  - Add 10+ shadcn/ui components
  - Build 8 app-level components
  - Dark mode support via next-themes

### Phase 2: Monetization (P1)
- [ ] **F001-003:** Polar Billing Integration
  - Convex component registration
  - Webhook handling via HTTP routes
  - Billing settings page
  - Configurable entitlement system
- [ ] **F001-004:** Enhanced RBAC
  - Owner role + 9 new permissions
  - Custom roles (Enterprise tier)
  - Preserve existing permission API

### Phase 3: Product Features (P2)
- [ ] **F001-005:** AI/LLM Integration
  - HTTP actions for streaming
  - Usage tracking + rate limiting
  - AI chat page with useChat
- [ ] **F001-006:** Notification System
  - In-app notifications (real-time)
  - Email templates (React Email)
  - Notification preferences
- [ ] **F001-007:** Onboarding System
  - Multi-step wizard
  - Progress tracking
- [ ] **F001-011:** Example App (Notes CRUD)
  - Full CRUD with permissions
  - Search, pagination, soft deletion
  - Entitlement gating

### Phase 4: Operations (P3)
- [ ] **F001-008:** Feature Flags
  - Global + per-team + tier-based flags
  - useFeatureFlag hook
- [ ] **F001-009:** Analytics & Event Tracking
  - track() mutation + useTrack() hook
  - Time-series aggregation queries
- [ ] **F001-010:** Super Admin Panel
  - Dashboard, user/team management
  - Feature flag management
  - Analytics dashboard
  - Audit log

---

## Acceptance Criteria (Testable)

### Auth (F001-001)
- [ ] User can sign up with email/password and is redirected to dashboard
- [ ] User can sign in with existing email/password and is redirected to dashboard
- [ ] User can reset password via forgot-password flow
- [ ] Existing team/member/invite flows work identically after migration
- [ ] No Clerk dependencies remain in package.json or codebase

### Design System (F001-002)
- [ ] All 10 new shadcn/ui components are installed and importable
- [ ] PageHeader, DataTable, EmptyState, StatusBadge render correctly
- [ ] Dark/light/system theme toggle works across all pages

### Billing (F001-003)
- [ ] Team admin can view billing page with current plan
- [ ] Polar checkout flow creates subscription and updates team tier
- [ ] Webhook correctly updates subscriptionTier and subscriptionStatus
- [ ] checkEntitlement correctly enforces member limits per tier
- [ ] Free tier teams have appropriate feature restrictions

### RBAC (F001-004)
- [ ] Owner role exists and can perform all actions
- [ ] Owner cannot leave team without transferring ownership
- [ ] New permissions are enforceable via existing viewerHasPermissionX API
- [ ] Custom roles can be created on Enterprise tier

### AI (F001-005)
- [ ] AI chat page renders with streaming responses
- [ ] Usage is tracked per team per billing period
- [ ] Rate limiting prevents exceeding tier quota
- [ ] "Use AI" permission gates access

### Notifications (F001-006)
- [ ] In-app notification bell shows unread count
- [ ] Clicking notification marks as read
- [ ] Email notifications sent for key events (invite, subscription change)

### Onboarding (F001-007)
- [ ] New user sees onboarding wizard after first sign-up
- [ ] Wizard tracks completed steps across sessions
- [ ] User can skip onboarding

### Feature Flags (F001-008)
- [ ] useFeatureFlag returns correct value based on resolution order
- [ ] Admin can toggle flags globally and per-team
- [ ] Flag changes propagate reactively without page refresh

### Analytics (F001-009)
- [ ] useTrack fires events that appear in analyticsEvents table
- [ ] Admin can view event counts and time-series data

### Super Admin (F001-010)
- [ ] Super admin can access /admin routes
- [ ] Non-super-admin users are blocked from /admin
- [ ] Dashboard shows user, team, and revenue metrics
- [ ] Admin actions are logged to auditLog table

### Example App (F001-011)
- [ ] Notes CRUD works with real-time updates
- [ ] Permission-gated: Contribute can create, Manage Content can delete others'
- [ ] Search works across note titles and content
- [ ] Entitlement gating limits notes per tier

---

## Success Definition

1. **Developer clones repo → working SaaS in 30 min:** Auth, billing, teams, and example app work after setting 5 env vars
2. **All modules are independently removable:** Developer can delete any module (AI, notifications, etc.) without breaking core functionality
3. **Zero security holes:** All mutations check auth, permissions, and entitlements; webhooks verify HMAC; no client-side auth decisions
4. **TypeScript strict mode passes:** `npm run lint` and `npm run build` succeed with zero errors
5. **Real-time everything:** All data updates propagate instantly via Convex subscriptions

---

## Cost Impact

| Service | Free Tier | Pro Tier Estimate |
|---------|-----------|-------------------|
| Convex | 1M function calls/mo | ~$25/mo at scale |
| Polar | No platform fee | % per transaction |
| OpenAI/Anthropic | N/A (user provides key) | $0.01-0.10/request |
| Resend | 3,000 emails/mo | $20/mo at scale |

AI costs are pass-through — the boilerplate tracks usage but each deployer configures their own API keys and pricing.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Convex Auth SSR limitations | High | Medium | Use client-side auth checks; avoid server-side fetchMutation for auth |
| Polar API changes | Low | Medium | Pin @convex-dev/polar version; abstract behind billing.ts |
| convex-ents compatibility with authTables | Medium | High | Test schema integration early; fall back to manual auth tables if needed |
| Feature scope creep per module | Medium | Medium | Strict acceptance criteria; each module is independently shippable |
| Migration breaks existing deployments | Low | High | Document migration path from v1; provide upgrade script |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-10 | Convex Auth over Clerk | Single source of truth; eliminates external dependency; simplifies deployment |
| 2026-02-10 | Email/password only (no OAuth) | Keeps auth setup simple — no external provider config. OAuth can be added later via Convex Auth providers. |
| 2026-02-10 | Configurable entitlements (not hardcoded tiers) | Each project defines its own tiers — boilerplate provides plumbing, not business logic |
| 2026-02-10 | Team-level billing (not per-user) | Matches B2B SaaS model (Slack, Notion, Linear) |
| 2026-02-10 | AI via Vercel AI SDK | Provider-agnostic; swap OpenAI/Anthropic via config; built-in streaming |
| 2026-02-10 | Feature flags in Convex (not LaunchDarkly) | Reactive subscriptions = instant propagation; no third-party dependency |
| 2026-02-10 | Replace messages with notes CRUD | Richer reference implementation demonstrating more patterns |
| 2026-02-10 | Owner/Admin/Member (3 fixed roles) | Owner is transferable highest-privilege; custom roles opt-in for Enterprise |
| 2026-02-10 | Super admin via isSuperAdmin boolean | Simple, orthogonal to team roles, easy to check |
| 2026-02-10 | First-party analytics (not Mixpanel/Amplitude) | Convex-native; no third-party data sharing; real-time dashboards |

---

## Appendix

### A. Plan Configuration Example

```typescript
// lib/planConfig.ts
export const PLAN_CONFIG = {
  free: {
    displayName: "Free",
    price: 0,
    limits: {
      members: 3,
      aiRequests: 100,
      notes: 50,
    },
    features: ["basic", "notes"],
  },
  pro: {
    displayName: "Pro",
    price: 29,
    limits: {
      members: 20,
      aiRequests: 5000,
      notes: -1, // unlimited
    },
    features: ["basic", "notes", "ai", "api", "analytics"],
  },
  enterprise: {
    displayName: "Enterprise",
    price: 99,
    limits: {
      members: -1,
      aiRequests: -1,
      notes: -1,
    },
    features: ["basic", "notes", "ai", "api", "analytics", "custom-roles", "sso"],
  },
} as const;
```

### B. New Permission Matrix

| Permission | Owner | Admin | Member |
|-----------|-------|-------|--------|
| Manage Team | Yes | Yes | No |
| Delete Team | Yes | Yes | No |
| Read Members | Yes | Yes | Yes |
| Manage Members | Yes | Yes | No |
| Contribute | Yes | Yes | Yes |
| Manage Billing | Yes | Yes | No |
| View Billing | Yes | Yes | Yes |
| Use AI | Yes | Yes | Yes |
| Manage AI Settings | Yes | Yes | No |
| View Analytics | Yes | Yes | No |
| Manage Integrations | Yes | Yes | No |
| Manage Feature Flags | Yes | Yes | No |
| Manage Content | Yes | Yes | No |
| View Content | Yes | Yes | Yes |

### C. Dependency Graph

```
F001-001 (Auth) ──────────┬──→ F001-003 (Billing) ──┬──→ F001-005 (AI)
                          │                          ├──→ F001-006 (Notifications)
F001-002 (Design System)  │                          ├──→ F001-007 (Onboarding)
  (parallel, no deps)     │                          ├──→ F001-008 (Feature Flags)
                          │                          └──→ F001-011 (Notes)
                          │
                          ├──→ F001-004 (RBAC) ──────┬──→ F001-005 (AI)
                          │                          ├──→ F001-011 (Notes)
                          │                          └──→ F001-010 (Admin)
                          │
                          └──→ F001-009 (Analytics) ─┬──→ F001-010 (Admin)
                                                     │
                          F001-008 (Feature Flags) ──┘
```

### D. Build Sequence

```
Batch 1 (parallel): F001-001 (Auth) + F001-002 (Design System)
Batch 2 (parallel): F001-003 (Billing) + F001-009 (Analytics)
Batch 3 (parallel): F001-004 (RBAC)
Batch 4 (parallel): F001-005 (AI) + F001-006 (Notifications) + F001-007 (Onboarding) + F001-008 (Feature Flags) + F001-011 (Notes)
Batch 5:            F001-010 (Super Admin)
```
