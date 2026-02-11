# PRD: SaaS Boilerplate V2 — Production-Grade Upgrade

> **ID:** F001
> **Status:** Draft
> **Author:** Jake
> **Created:** 2026-02-10
> **Last Updated:** 2026-02-10

---

## Context Summary
<!-- REQUIRED: This section is loaded by /build for child features. Keep under 50 lines. -->

**Vision:** Transform the existing SaaS starter into a world-class, production-grade boilerplate with auth, billing, AI, admin, feature flags, and analytics — using Convex-native solutions where transactional integrity matters and PostHog where a mature platform provides better value.

**Problem:** The current starter has solid multi-tenant foundations but lacks billing, AI integration, admin tooling, feature flags, analytics, and onboarding — making it unsuitable for shipping real products without weeks of additional work.

**Key Decisions:**
- Replace Clerk with Convex Auth (single source of truth, no external auth dependency)
- Auth: Convex Auth with email/password + magic link via Resend OTP (no OAuth providers — keeps setup simple)
- Team-level billing via Polar (B2B SaaS model: Slack, Notion, Linear) with credit-based AI consumption
- Feature flags via PostHog (rollouts, A/B tests, admin toggle via API proxy)
- AI via Vercel AI SDK — dual streaming patterns: Next.js API route (default) + Convex HTTP action (alternative)
- Super admin via `isSuperAdmin` boolean on users (orthogonal to team roles)
- Configurable entitlement system (tiers, limits, feature gates defined in config, not hardcoded)
- Three fixed roles (Owner/Admin/Member) with opt-in custom roles for Enterprise tier
- Marketing site with modular landing page sections, legal pages, contact form
- MDX-based blog and changelog for content marketing (zero runtime cost)
- Production infrastructure: Sentry error monitoring, Vercel Analytics + Speed Insights, preview seed data
- Deploy on Vercel with GitHub auto-deploy; Convex backend on `.convex.cloud`
- Waitlist/pre-launch mode toggled via feature flag

**Schema Changes:**
- `users`: Remove `tokenIdentifier`, add `isSuperAdmin`, `timezone`, `avatarStorageId`; integrate `authTables`
- `teams`: Add `polarCustomerId`, `subscriptionTier`, `subscriptionStatus`, `avatarStorageId`
- `notes`: Add `attachmentStorageIds` for file attachments
- New tables: `notes`, `aiUsage`, `aiConversations`, `aiMessages`, `notifications`, `notificationPreferences`, `onboardingProgress`, `auditLog`, `waitlistEntries`, `changelogSubscribers`
- Removed tables (replaced by PostHog — see [ADR-008](../adrs/008-posthog-analytics-flags.md)): `featureFlags`, `teamFeatureFlags`, `analyticsEvents`

### Child Features

| ID | Name | Priority | Status | Dependencies | Notes |
|----|------|----------|--------|--------------|-------|
| F001-001 | Convex Auth Migration + Magic Link | P0 | pending | None | **Enhanced** — add Resend OTP magic link, session management, timezone preference |
| F001-002 | Design System Expansion | P0 | done | None | |
| F001-003 | Polar Billing + Credit System | P1 | pending | F001-001 | **Enhanced** — add credit-based AI consumption |
| F001-004 | Enhanced RBAC | P1 | pending | F001-001, F001-003 | **Enhanced** — add ownership transfer, invite expiration/revoke/resend, team avatar |
| F001-005 | AI/LLM Integration (Dual Streaming) | P2 | pending | F001-003, F001-004 | **Enhanced** — ship Next.js API route + Convex HTTP action |
| F001-006 | Notification System | P2 | pending | F001-001, F001-003 | **Enhanced** — add 8-12 React Email templates, email preview dev route |
| F001-007 | Onboarding System | P2 | pending | F001-001, F001-003 | |
| F001-008 | Feature Flags | P3 | pending | F001-003 | |
| F001-009 | Analytics & Event Tracking | P3 | pending | F001-001 | |
| F001-010 | Super Admin Panel | P3 | pending | F001-003, F001-004, F001-008, F001-009 | **Enhanced** — add user impersonation with audit trail |
| F001-011 | Example App (Notes CRUD) | P2 | pending | F001-001, F001-004, F001-003 | **Enhanced** — add command palette (Cmd+K), file attachments |
| F001-012 | Marketing Site & Legal Pages | P1 | pending | F001-002 | **NEW** |
| F001-013 | Blog & Changelog (MDX) | P2 | pending | F001-012 | **Enhanced** — add changelog email subscription, "What's New" badge |
| F001-014 | Production Infrastructure | P1 | pending | None | **Enhanced** — add cron jobs (`convex/crons.ts`), rate limiter setup |
| F001-015 | Waitlist / Pre-Launch Mode | P3 | pending | F001-008, F001-006 | **NEW** |
| F001-016 | Testing & Quality Infrastructure | P0 | pending | None | **NEW** — Vitest, Playwright, CI/CD, pre-commit hooks |
| F001-017 | File Storage & Uploads | P1 | pending | F001-002 | **NEW** — Convex built-in file storage, avatar uploads, `<FileUploader>` component |

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
- "How do I customize the landing page?" (F001-012)
- "How do I deploy this to production?" (F001-014)
- "How do I add a blog post?" (F001-013)
- "How do I run a waitlist before launch?" (F001-015)
- "How do I handle file uploads?" (F001-017)
- "How do I search across my app?" (F001-011 — command palette)

---

## Executive Summary

This PRD defines the transformation of an existing SaaS starter kit into a comprehensive, production-grade boilerplate. The current codebase provides multi-tenant foundations (teams, RBAC, invites, soft deletion) built on Next.js 14, Convex, Clerk, and shadcn/ui. It needs to evolve into a complete platform with native auth, billing, AI integration, admin tooling, feature flags, analytics, onboarding, a polished marketing site, content marketing infrastructure, and production deployment tooling.

The upgrade is structured as 17 independent-but-connected modules, each buildable via the Vibe System's `/build` workflow. The architecture prioritizes Convex-native solutions (auth, audit logging, entitlements, file storage, cron jobs) where transactional integrity matters, and uses PostHog for product analytics and feature flags where a mature platform provides better value than custom code (see [ADR-008](../adrs/008-posthog-analytics-flags.md)).

**Before:** A starter with auth (Clerk), teams, and basic RBAC. Developers must build billing, AI, admin, notifications, analytics, marketing pages, and deployment infrastructure from scratch.

**After:** A complete SaaS platform with Convex Auth (email/password + magic link), Polar billing with credit-based AI consumption, dual AI/LLM streaming patterns, super admin panel with impersonation, feature flags, in-app notifications with transactional email templates, onboarding wizard, analytics, file storage with avatar uploads, cron jobs for housekeeping, command palette (Cmd+K), a polished marketing site with legal pages, MDX blog/changelog, Sentry error monitoring, Vercel Analytics, preview seed data, waitlist mode, and a rich example app — all following consistent patterns and ready for customization.

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

A boilerplate where cloning the repo and setting environment variables gives you:
- User auth with email/password + magic link via Convex Auth, session management, timezone support
- Multi-tenant teams with Owner/Admin/Member roles, ownership transfer, invite management
- Billing per team via Polar with configurable tiers, entitlements, and credit-based AI consumption
- AI chat with dual streaming patterns (Next.js API route + Convex HTTP action), usage tracking, and rate limiting
- File storage with drag-drop uploader, avatar uploads, and per-tier storage quotas (Convex built-in)
- In-app + email notifications with 8-12 branded transactional email templates
- Guided onboarding for new users and teams
- Feature flags via PostHog with admin management UI
- Product analytics and feature flags via PostHog (see [ADR-008](../adrs/008-posthog-analytics-flags.md))
- Super admin panel with user impersonation and audit trail
- Global search / command palette (Cmd+K) with Convex full-text search
- Cron jobs for housekeeping (invite cleanup, credit resets, subscription sync)
- A polished marketing site with hero, features, pricing, FAQ, contact form, and legal pages
- MDX-based blog and changelog with email subscription and "What's New" badge
- Sentry error monitoring, Vercel Analytics, and Speed Insights
- Preview deployment seed data for PR reviews
- Waitlist/pre-launch mode with admin approval workflow
- A rich example app demonstrating every pattern

---

## Feature Outline (Approved)

### What Changes

| Component | Current State | New State |
|-----------|--------------|-----------|
| Auth | Clerk (`@clerk/nextjs`) | Convex Auth (`@convex-dev/auth`) — email/password + magic link via Resend OTP |
| Auth pages | Clerk hosted/modal | Custom sign-in/sign-up/forgot-password pages |
| Middleware | Clerk `authMiddleware` | Simple redirect-based middleware via `createRouteMatcher` |
| Provider | `ClerkProvider` + `ConvexProviderWithClerk` | Two-layer: `ConvexAuthNextjsServerProvider` + `ConvexAuthNextjsProvider` |
| User lookup | `tokenIdentifier` from Clerk JWT | Session-based via Convex Auth (`getAuthUserId()`) |
| Billing | None | Polar via `@convex-dev/polar` component + credit-based AI consumption |
| Entitlements | None | Configurable tier/limit/feature-gate system with credit decrement |
| Roles | Admin, Member (2) | Owner, Admin, Member (3) + custom roles |
| Permissions | 5 | ~14 |
| AI | None | Vercel AI SDK — dual: Next.js API route (default) + Convex HTTP action (alt) |
| Notifications | Invite emails only | In-app (real-time) + email templates |
| Onboarding | None | Multi-step wizard |
| Feature flags | None | PostHog feature flags with admin proxy (see [ADR-008](../adrs/008-posthog-analytics-flags.md)) |
| Analytics | None | PostHog product analytics with `useTrack()` wrapper (see [ADR-008](../adrs/008-posthog-analytics-flags.md)) |
| Admin | None | Super admin panel (`/admin`) |
| File storage | None | Convex built-in file storage, `<FileUploader>` component, avatar uploads, storage quotas |
| Cron jobs | None | `convex/crons.ts` — invite cleanup, credit resets, subscription sync, stale session cleanup |
| Command palette | None | Cmd+K global search via shadcn `Command` + Convex search indexes |
| Session management | None | Active sessions list, "Log out all devices", session-based auth |
| Invite management | Basic invites | Invite expiration (7-day TTL), revoke/resend, rate limiting |
| Email templates | Invite email only | 8-12 branded transactional emails (welcome, invite, billing, limits, etc.) |
| Impersonation | None | Super admin "View as User" with audit trail, read-only mode |
| Ownership transfer | None | Transfer team ownership mutation + confirmation flow |
| Demo content | Messages (basic chat) | Notes CRUD (rich reference implementation) |
| Landing page | Bare `/` route | Modular marketing site: hero, features, pricing, FAQ, CTA |
| Legal pages | None | ToS, Privacy Policy, Cookie Policy (MDX) |
| Blog | None | MDX-based blog + changelog (static generation) |
| Error monitoring | None | Sentry (`@sentry/nextjs`) — optional, env-var gated |
| Performance monitoring | None | Vercel Analytics + Speed Insights |
| Preview deploys | No seed data | Preview seed data function for Convex |
| Waitlist | None | Pre-launch email collection with admin approval |
| UI components | 39 shadcn/ui | 49+ shadcn/ui + 14 app-level components |

### Key Flows

1. **New user sign-up:** Landing page > Sign up (email/password or magic link) > `afterUserCreatedOrUpdated` callback auto-creates personal team > Onboarding wizard > Dashboard
2. **Team creation + billing:** Create team > Select plan (free/pro/enterprise) > Polar checkout (team-level, via `getUserInfo` mapped to team) > Webhook updates `subscriptionTier` > Team activated with entitlements
3. **AI usage:** Team member opens AI chat > Sends prompt > Streaming response via Next.js API route (default) or Convex HTTP action (alt) > Credits decremented from tier quota > Usage tracked per team per period
4. **Admin oversight:** Super admin logs in > `/admin` dashboard > Views user/team metrics, manages feature flags, reviews audit log
5. **Marketing funnel:** Visitor lands on `/` > Reads features/pricing/FAQ > Clicks CTA to sign up or submits contact form
6. **Waitlist flow:** `waitlist_mode` flag enabled > Visitors see `/waitlist` > Submit email > Admin approves > Approved user gets invite email via Resend
7. **File upload:** User drags file into `<FileUploader>` > Client calls `generateUploadUrl()` mutation > Browser POSTs file to Convex storage > Storage ID saved to entity > `getUrl()` renders file
8. **Command palette:** User presses Cmd+K > `<Command>` dialog opens > Types search query > Convex search indexes return matching notes/teams/members > User selects result > Navigates to page

### Out of Scope (This Build)

- Mobile app / React Native
- Multi-language / i18n
- Custom domain per team
- Real-time collaboration (beyond Convex subscriptions)
- SSO / SAML / OAuth providers (can be added later)
- Public API with API keys (post-V2 — uses Convex `httpRouter` when ready)
- Outbound webhook management for end users (post-V2 — enterprise feature)
- MFA / TOTP (Convex Auth v0.0.90 doesn't support TOTP; revisit when available)
- Data export / GDPR portability (post-V2 — straightforward with Convex `ctx.storage` + `ctx.scheduler`)
- In-app feedback widget (post-V2 — low effort, easy to add later)
- Figma UI kit (not code — out of scope)
- Plugin / extension system (modular architecture already allows removing modules)
- Turborepo monorepo (single Next.js app is simpler for a boilerplate)
- Multiple billing providers (committed to Polar)
- CMS abstraction layer (MDX is sufficient; swappable by developer)

### Relationship to Other Features

| Feature | Relates To | How |
|---------|-----------|-----|
| Auth (F001-001) | Everything | Foundation — all modules depend on authenticated context |
| Billing (F001-003) | Entitlements, AI, Feature Flags | Tier determines limits and feature access; credits gate AI usage |
| RBAC (F001-004) | All team features | Permissions gate every team action |
| AI (F001-005) | Billing, RBAC | Rate-limited by tier credits, gated by permission |
| Feature Flags (F001-008) | Admin, Billing, Waitlist | PostHog flags; admin manages via API proxy; controls pre-launch mode |
| Analytics (F001-009) | Admin, Prod Infra | PostHog analytics; dashboards in PostHog; reverse proxy in next.config |
| Admin (F001-010) | Everything | Admin panel aggregates all modules |
| Marketing (F001-012) | Billing, Design System | Pricing table reads from `planConfig.ts`; uses design system components |
| Blog (F001-013) | Marketing | Shares layout/navigation with marketing site |
| Prod Infra (F001-014) | Everything | Error monitoring, analytics, and deployment tooling for all modules |
| File Storage (F001-017) | RBAC, Notes, Design System | Avatar uploads (user + team), note attachments, `<FileUploader>` component, storage quotas per tier |
| Waitlist (F001-015) | Feature Flags, Notifications | Controlled by feature flag; sends emails via Resend |

---

## Architecture

### System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Next.js 14 (App Router) — Deployed on Vercel │
│                                                                   │
│  Public:                    Authenticated:          Admin:        │
│  app/                       app/t/[teamSlug]/       app/admin/    │
│  ├─ (marketing)/            ├─ dashboard            ├─ dashboard  │
│  │  ├─ page.tsx (landing)   ├─ settings/billing     ├─ users     │
│  │  ├─ pricing/             ├─ settings/members     ├─ teams     │
│  │  ├─ contact/             ├─ notes                ├─ flags     │
│  │  └─ legal/               └─ ai                   ├─ analytics │
│  ├─ blog/                                           └─ waitlist  │
│  ├─ changelog/              Auth:                                │
│  ├─ waitlist/               app/auth/                            │
│  └─ api/ai/chat/            ├─ sign-in                           │
│     (Vercel Edge)           ├─ sign-up                           │
│                             └─ forgot-password                   │
│                                                                   │
│  Providers: ConvexAuthNextjsServerProvider (server)               │
│           + ConvexAuthNextjsProvider (client)                     │
│  Monitoring: @sentry/nextjs + @vercel/analytics + @vercel/speed  │
│  Analytics: posthog-js (reverse proxied via /ph/*)               │
│  useConvexAuth / useQuery / useMutation / useChat                │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Convex React Client
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Convex Backend (.convex.cloud)                │
│                                                                   │
│  convex/                                                          │
│  ├─ auth.ts              (Convex Auth: Password + ResendOTP)      │
│  ├─ schema.ts            (convex-ents + authTables)               │
│  ├─ functions.ts         (query/mutation wrappers)                │
│  ├─ permissions.ts       (RBAC checks)                            │
│  ├─ entitlements.ts      (tier/limit/credit checks)               │
│  ├─ billing.ts           (Polar integration)                      │
│  ├─ http.ts              (HTTP routes: webhooks, AI stream alt)   │
│  ├─ convex.config.ts     (Polar component registration)           │
│  ├─ helpers/ResendOTP.ts (Magic link email provider)              │
│  ├─ seedPreview.ts       (Preview deploy seed data)               │
│  ├─ users/teams/         (Team CRUD, members, invites)            │
│  ├─ notes/               (Example CRUD app)                       │
│  ├─ ai/                  (AI conversations, usage, credits)       │
│  ├─ notifications/       (In-app + email)                         │
│  ├─ posthog.ts           (Server-side PostHog tracking)            │
│  ├─ waitlist/            (Waitlist entries + approval)             │
│  └─ admin/               (Super admin queries/mutations)          │
│                                                                   │
│  Security Layers:                                                 │
│  1. Schema: validators, unique constraints, soft deletion         │
│  2. Runtime: viewerX(), viewerHasPermissionX(),                   │
│     checkEntitlement(), checkRateLimit()                          │
│  3. Infrastructure: env vars, HMAC webhook verification           │
└──────────────────────┬───────────────────────────────────────────┘
                       │
           ┌───────────┼───────────┬───────────┬───────────┐
           ▼           ▼           ▼           ▼           ▼
      Polar API   OpenAI/Claude   Resend     Sentry     PostHog
      (Billing)   (AI Providers)  (Email)    (Errors)   (Analytics
                                                         + Flags)
```

### Auth Flow (Post-Migration)

```
User visits /auth/sign-in
  → Option A: Email/password sign-in via Convex Auth Password provider
  → Option B: Magic link sign-in via Convex Auth ResendOTP provider
  → Session created in Convex
  → ConvexAuthNextjsProvider detects session
  → afterUserCreatedOrUpdated callback: auto-creates personal team
  → Redirect to /t (triggers user store)
  → Redirect to /t/[teamSlug] (dashboard) or /t/onboarding (first time)
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
- ADD: timezone: v.optional(v.string()) — IANA timezone (e.g., "America/New_York")
- ADD: avatarStorageId: v.optional(v.id("_storage")) — Convex file storage reference
- Integration with authTables from @convex-dev/auth
```

#### `teams`
```
- ADD: polarCustomerId: v.optional(v.string())
- ADD: subscriptionTier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")))
- ADD: subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due"), v.literal("trialing")))
- ADD: avatarStorageId: v.optional(v.id("_storage")) — Convex file storage reference
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
  attachmentStorageIds: v.optional(v.array(v.id("_storage"))),
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

#### ~~`featureFlags`~~ — Removed (replaced by PostHog, see [ADR-008](../adrs/008-posthog-analytics-flags.md))

#### ~~`teamFeatureFlags`~~ — Removed (replaced by PostHog, see [ADR-008](../adrs/008-posthog-analytics-flags.md))

#### ~~`analyticsEvents`~~ — Removed (replaced by PostHog, see [ADR-008](../adrs/008-posthog-analytics-flags.md))

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

#### `waitlistEntries`
```typescript
waitlistEntries: defineEnt({
  email: v.string(),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
})
  .field("email", v.string(), { unique: true })
  .index("status", ["status"])
```

#### `changelogSubscribers`
```typescript
changelogSubscribers: defineEnt({
  email: v.string(),
})
  .field("email", v.string(), { unique: true })
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

### Feature Flag Resolution (PostHog)
```
1. Client calls useFeatureFlag("new-dashboard")
2. Hook wraps PostHog's useFeatureFlagEnabled()
   a. PostHog evaluates flag based on user properties, team group, percentage rollout
   b. Flags are polled every ~30s (not instant like Convex subscriptions)
   c. Returns false when PostHog is not configured (graceful degradation)
3. Admin manages flags via /admin/flags → proxies PostHog REST API
```

### Credit-Based Entitlement Check Flow
```
1. User action triggers mutation (e.g., AI request)
2. Mutation calls checkEntitlement(ctx, teamId, "aiCredits")
3. checkEntitlement:
   a. Gets team.subscriptionTier (default: "free")
   b. Reads PLAN_CONFIG[tier].limits.aiCredits → totalCredits
   c. Queries aiUsage for current period → creditsUsed
   d. Returns { allowed: creditsUsed < totalCredits, used, limit, remaining }
4. If not allowed → throw ConvexError with credit details and upgrade prompt
5. If allowed → proceed with action
6. After completion → decrement credits based on model/token usage
   (e.g., GPT-4 costs 10 credits, Claude Haiku costs 2 credits)
```

### AI Streaming Flow (Dual Pattern)

**Default: Next.js API Route (Vercel Edge)**
```
1. Client calls useChat() (Vercel AI SDK)
2. Request hits Next.js API route: POST /api/ai/chat (Vercel Edge Function)
3. API route:
   a. Authenticates user via Convex session token
   b. Calls Convex mutation to check permission + entitlement + rate limit
   c. Creates/updates aiConversation via Convex mutation
   d. Calls AI provider via Vercel AI SDK (streamText)
   e. Streams response to client
   f. On completion: calls Convex mutation to save aiMessage + update credit usage
4. Client receives streamed tokens via useChat
```

**Alternative: Convex HTTP Action**
```
1. Client calls useChat() (Vercel AI SDK) pointed at .convex.site URL
2. Request hits Convex HTTP action: POST /api/ai/chat
3. HTTP action:
   a. Authenticates user via session token
   b. Checks permission: "Use AI"
   c. Checks entitlement: credits remaining
   d. Checks rate limit: token bucket for team
   e. Creates/updates aiConversation
   f. Calls AI provider via Vercel AI SDK (streamText)
   g. Streams response to client
   h. Schedules mutation to save aiMessage + update credit usage
4. Client receives streamed tokens via useChat
```

Both patterns share the same Convex mutations for saving messages, tracking usage, and checking entitlements. Only the streaming transport differs.

### File Upload Flow (Convex Built-in)
```
1. User drags file into <FileUploader> component
2. Client calls generateUploadUrl mutation
   a. Authenticate user
   b. Check permission: "Contribute"
   c. Check entitlement: storage quota remaining
   d. ctx.storage.generateUploadUrl() returns signed URL
3. Browser POSTs file directly to Convex storage (signed URL)
4. Client receives storageId
5. Client calls mutation to save storageId on entity (note, user avatar, team avatar)
6. Rendering: ctx.storage.getUrl(storageId) returns public URL
```

### Cron Jobs (Convex Built-in)
```
convex/crons.ts:
- daily "clean expired invites" → internal.invites.cleanExpired (3:00 AM UTC)
- monthly "reset credits" → internal.billing.resetCredits (1st, midnight UTC)
- hourly "sync subscriptions" → internal.billing.syncSubscriptionStatus
- daily "clean stale sessions" → internal.auth.cleanStaleSessions (4:00 AM UTC)
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
| 6 | Feature flag changed while user on page | Inconsistent UI state | Low | PostHog polls flags every ~30s; acceptable for rollout use cases |
| 7 | Super admin impersonates deleted user | Access to soft-deleted data | Medium | Impersonation is read-only; soft-deleted users shown with clear indicator |
| 8 | Concurrent role changes on same member | Race condition | Low | Convex transactions are serializable; last write wins |
| 9 | Invite sent to email already on team | Confusion, duplicate member | Medium | Check existing membership before creating invite; show clear error |
| 10 | Email delivery fails during password reset | User can't recover account | Medium | Show retry option; log for monitoring |
| 11 | Billing webhook replay attack | Duplicate subscription updates | High | Polar component handles idempotency via event IDs |
| 12 | AI usage counter drift | User charged more/less than actual | Medium | Reconcile usage counts periodically via scheduled function |
| 13 | Team at member limit tries to accept invite | Exceeds entitlement | Medium | Check entitlement in invite acceptance flow; reject with upgrade prompt |
| 14 | Analytics data retention | N/A | N/A | PostHog manages data retention (1 year on free tier); no Convex table to manage |
| 15 | Magic link email not delivered | User can't sign in | Medium | Fall back to email/password; show "Didn't receive email?" with retry |
| 16 | Credit calculation drift (token counting) | User overcharged/undercharged | Medium | Use conservative estimate before streaming; reconcile after completion |
| 17 | Sentry DSN not configured | No error monitoring | Low | All Sentry code env-var gated; app works fine without it |
| 18 | Waitlist mode enabled but no admin to approve | Users stuck in pending | Medium | First super admin auto-created; admin panel shows pending count badge |
| 19 | MDX blog post has invalid frontmatter | Build fails on Vercel | Medium | Validate frontmatter schema at build time; fail fast with clear error |
| 20 | Preview deploy seed data conflicts with real data | Data corruption | Low | Seed only runs in preview deployments; checks for existing data first |
| 21 | Dual AI streaming pattern confusion | Developer uses wrong pattern | Low | Default is Next.js API route; Convex HTTP action documented as alternative with clear trade-offs |
| 22 | Duplicate waitlist email submission | Confusion or spam | Low | Unique constraint on email; show "already on waitlist" message |
| 23 | File upload exceeds size limit | Large file consumes storage | Medium | Client-side size validation + server-side check; reject with clear error + tier upgrade prompt |
| 24 | File upload of disallowed type | Security risk (executable uploads) | High | Allowlist of MIME types (images, PDFs, CSVs); reject others before upload |
| 25 | Storage quota exceeded | Team can't upload more files | Medium | Check entitlement before `generateUploadUrl()`; show usage meter + upgrade prompt |
| 26 | Expired invite still accessible | User joins after invite TTL | Medium | `ctx.scheduler.runAt()` auto-deletes after 7 days; acceptance checks expiry timestamp |
| 27 | Ownership transfer to non-admin | Privilege escalation risk | Medium | Only current Owner can transfer; target must be existing team member; confirm via dialog |
| 28 | Impersonation session persists | Admin acts as user permanently | Medium | Impersonation auto-expires after 30 min; read-only flag prevents mutations; audit log every action |
| 29 | Cron job fails silently | Expired invites accumulate | Low | Cron failures appear in Convex dashboard; add Sentry capture in action wrapper |
| 30 | Command palette returns too many results | Slow search, poor UX | Low | Limit search results to 10 per category; debounce input; prefix matching |

---

## File Changes

### New Files

| File | Module | Purpose |
|------|--------|---------|
| **Auth (F001-001)** | | |
| `convex/auth.ts` | F001-001 | Convex Auth provider config (Password + ResendOTP) |
| `convex/helpers/ResendOTP.ts` | F001-001 | Custom Resend OTP provider with branded email template |
| `app/auth/sign-in/page.tsx` | F001-001 | Sign-in page (email/password + magic link) |
| `app/auth/sign-up/page.tsx` | F001-001 | Sign-up page |
| `app/auth/forgot-password/page.tsx` | F001-001 | Password reset page |
| **Design System (F001-002)** | | |
| `components/PageHeader.tsx` | F001-002 | Consistent page header with breadcrumbs |
| `components/DataTable.tsx` | F001-002 | Configurable data table |
| `components/EmptyState.tsx` | F001-002 | Standardized empty states |
| `components/StatusBadge.tsx` | F001-002 | Subscription/status indicators |
| `components/PricingCard.tsx` | F001-002 | Plan comparison cards |
| `components/UsageMeter.tsx` | F001-002 | Visual usage bars |
| `components/StepWizard.tsx` | F001-002 | Multi-step form/onboarding |
| `components/ThemeToggle.tsx` | F001-002 | Dark/light/system toggle |
| **Billing (F001-003)** | | |
| `convex/convex.config.ts` | F001-003 | Component registration (Polar) |
| `convex/http.ts` | F001-003 | HTTP routes (Polar webhooks, AI streaming alt) |
| `convex/billing.ts` | F001-003 | Polar integration queries/mutations |
| `convex/entitlements.ts` | F001-003 | Tier config + entitlement/credit check functions |
| `convex/rateLimiting.ts` | F001-003 | Token bucket rate limiter |
| `lib/planConfig.ts` | F001-003 | Configurable tier/entitlement/credit definitions |
| `app/t/[teamSlug]/settings/billing/page.tsx` | F001-003 | Billing settings page |
| **AI (F001-005)** | | |
| `convex/ai/` | F001-005 | AI conversations, messages, credit tracking |
| `app/api/ai/chat/route.ts` | F001-005 | Next.js API route for AI streaming (default, Vercel Edge) |
| `app/t/[teamSlug]/ai/page.tsx` | F001-005 | AI chat page |
| **Other Backend** | | |
| `convex/notes/` | F001-011 | Notes CRUD (queries, mutations) |
| `convex/notifications/` | F001-006 | Notification create/list/mark-read + preferences |
| `emails/welcome.tsx` | F001-006 | Welcome email template (React Email) |
| `emails/invite-sent.tsx` | F001-006 | Team invite email template |
| `emails/invite-accepted.tsx` | F001-006 | Invite accepted notification email |
| `emails/subscription-changed.tsx` | F001-006 | Plan upgrade/downgrade email |
| `emails/payment-failed.tsx` | F001-006 | Failed payment notification email |
| `emails/payment-received.tsx` | F001-006 | Payment confirmation email |
| `emails/approaching-limit.tsx` | F001-006 | 80% usage warning email (credits, storage, members) |
| `emails/member-removed.tsx` | F001-006 | Team member removal notification email |
| `emails/layout.tsx` | F001-006 | Shared email layout (brand header + footer) |
| `app/dev/emails/page.tsx` | F001-006 | Email preview dev route (dev only) |
| `lib/posthog/client.ts` | F001-008/009 | PostHog browser singleton (env-var gated) |
| `lib/posthog/server.ts` | F001-008/009 | PostHog server-side singleton (serverless-compatible) |
| `app/PostHogProvider.tsx` | F001-008/009 | PostHog React provider wrapper (no-op when unconfigured) |
| `app/PostHogPageView.tsx` | F001-008/009 | Manual pageview capture for App Router |
| `lib/hooks/use-track.ts` | F001-009 | `useTrack()` wraps `posthog.capture()` |
| `lib/hooks/use-feature-flag.ts` | F001-008 | `useFeatureFlag()` wraps PostHog flag evaluation |
| `lib/hooks/use-posthog-identify.ts` | F001-008/009 | PostHog identify + group calls after auth |
| `app/api/posthog/flags/route.ts` | F001-008 | Admin flag list/create (proxies PostHog API) |
| `app/api/posthog/flags/[id]/route.ts` | F001-008 | Admin flag toggle/update/delete |
| `convex/posthog.ts` | F001-009 | Server-side PostHog tracking from Convex mutations |
| `convex/admin/` | F001-010 | Super admin queries/mutations + audit log |
| `convex/admin/impersonation.ts` | F001-010 | Impersonation mutations (start/stop) + audit logging |
| `convex/waitlist/` | F001-015 | Waitlist entry CRUD + approval workflow |
| **Other Frontend** | | |
| `app/t/[teamSlug]/notes/page.tsx` | F001-011 | Notes list page |
| `components/CommandPalette.tsx` | F001-011 | Cmd+K command palette (shadcn `Command` + Convex search) |
| `app/t/onboarding/page.tsx` | F001-007 | Onboarding wizard |
| `app/admin/` | F001-010 | Super admin panel pages |
| `components/ImpersonationBanner.tsx` | F001-010 | "Viewing as [Name] — Exit" banner during impersonation |
| **Marketing Site (F001-012)** | | |
| `app/(marketing)/page.tsx` | F001-012 | Landing page (hero + features + pricing + FAQ + CTA) |
| `app/(marketing)/pricing/page.tsx` | F001-012 | Dedicated pricing page (reads from `planConfig.ts`) |
| `app/(marketing)/contact/page.tsx` | F001-012 | Contact form (sends via Resend) |
| `app/(marketing)/legal/terms/page.tsx` | F001-012 | Terms of Service (MDX) |
| `app/(marketing)/legal/privacy/page.tsx` | F001-012 | Privacy Policy (MDX) |
| `app/(marketing)/legal/cookies/page.tsx` | F001-012 | Cookie Policy (MDX) |
| `app/(marketing)/layout.tsx` | F001-012 | Marketing layout (nav + footer) |
| `components/HeroSection.tsx` | F001-012 | Headline + subline + CTA buttons |
| `components/FeaturesGrid.tsx` | F001-012 | Icon + title + description cards |
| `components/PricingTable.tsx` | F001-012 | Plan comparison (reads from `planConfig.ts`) |
| `components/FAQAccordion.tsx` | F001-012 | Configurable Q&A pairs (shadcn Accordion) |
| `components/CTASection.tsx` | F001-012 | Bottom call-to-action banner |
| `components/ContactForm.tsx` | F001-012 | Name/email/message + Resend integration |
| `content/legal/terms.mdx` | F001-012 | Terms of Service template |
| `content/legal/privacy.mdx` | F001-012 | Privacy Policy template |
| `content/legal/cookies.mdx` | F001-012 | Cookie Policy template |
| **Blog & Changelog (F001-013)** | | |
| `app/blog/page.tsx` | F001-013 | Blog listing page |
| `app/blog/[slug]/page.tsx` | F001-013 | Individual blog post |
| `app/changelog/page.tsx` | F001-013 | Changelog listing |
| `content/blog/` | F001-013 | MDX blog posts directory |
| `content/changelog/` | F001-013 | MDX changelog entries directory |
| `lib/mdx.ts` | F001-013 | MDX processing utilities |
| `convex/changelog.ts` | F001-013 | Changelog subscriber mutations (subscribe/unsubscribe) |
| `components/WhatsNewBadge.tsx` | F001-013 | "What's New" badge in app header (dismissible, tracks last seen) |
| **Production Infrastructure (F001-014)** | | |
| `sentry.client.config.ts` | F001-014 | Sentry client-side config |
| `sentry.server.config.ts` | F001-014 | Sentry server-side config |
| `sentry.edge.config.ts` | F001-014 | Sentry edge runtime config |
| `app/monitoring/[[...path]]/route.ts` | F001-014 | Sentry tunnel route (avoids ad-blockers) |
| `convex/crons.ts` | F001-014 | Cron jobs (invite cleanup, credit reset, subscription sync, session cleanup) |
| `convex/seedPreview.ts` | F001-014 | Preview deploy seed data function |
| `docs/deployment.md` | F001-014 | Vercel deployment guide |
| **Waitlist (F001-015)** | | |
| `app/waitlist/page.tsx` | F001-015 | Public waitlist signup page |
| `app/admin/waitlist/page.tsx` | F001-015 | Admin waitlist management |
| **Testing & Quality (F001-016)** | | |
| `vitest.config.ts` | F001-016 | Vitest configuration |
| `playwright.config.ts` | F001-016 | Playwright E2E configuration |
| `tests/setup.ts` | F001-016 | Vitest global setup (jest-dom matchers) |
| `convex/__tests__/permissions.test.ts` | F001-016 | Seed permission tests |
| `lib/__tests__/planConfig.test.ts` | F001-016 | Seed plan config tests |
| `e2e/fixtures/auth.ts` | F001-016 | Reusable auth fixture for E2E |
| `e2e/auth.spec.ts` | F001-016 | Seed auth E2E tests |
| `e2e/accessibility.spec.ts` | F001-016 | Accessibility scans (axe-core) |
| `.github/workflows/ci.yml` | F001-016 | CI pipeline (type-check, lint, test, e2e) |
| `.husky/pre-commit` | F001-016 | Pre-commit hook (lint-staged) |
| `ARCHITECTURE.md` | F001-016 | System design, data model, flows |
| `CONTRIBUTING.md` | F001-016 | Dev setup, testing, PR process |
| `docs/adrs/` | F001-016 | 8 Architecture Decision Records |
| **File Storage & Uploads (F001-017)** | | |
| `components/FileUploader.tsx` | F001-017 | Drag-drop file uploader with progress bar, type validation, size limit |
| `convex/storage.ts` | F001-017 | File storage mutations (generateUploadUrl, deleteFile, getFileUrl) |
| `convex/storage/avatars.ts` | F001-017 | Avatar-specific upload/crop mutations (user + team) |
| `app/t/[teamSlug]/settings/page.tsx` | F001-017 | Team settings with avatar upload |

### Modified Files

| File | Changes |
|------|---------|
| `convex/schema.ts` | Add authTables integration, new entities (incl. waitlistEntries, changelogSubscribers), expand roles/permissions, add `avatarStorageId` to users/teams, `timezone` to users, `attachmentStorageIds` to notes. Remove `featureFlags`, `teamFeatureFlags`, `analyticsEvents` tables (replaced by PostHog). |
| `convex/functions.ts` | Session-based user lookup via `getAuthUserId()` (replace tokenIdentifier) |
| `convex/permissions.ts` | Add Owner role, 9 new permissions, preserve API surface |
| `convex/init.ts` | Seed new roles, permissions, default feature flags |
| `convex/users.ts` | Update store mutation for Convex Auth identity shape; `afterUserCreatedOrUpdated` callback for auto-team creation |
| `convex/users/teams.ts` | Add billing fields to team creation; `polarCustomerId` integration |
| `convex/users/teams/members.ts` | Owner role enforcement |
| `convex/invites.ts` | Entitlement check on invite acceptance; add invite expiration (7-day TTL via `ctx.scheduler.runAt()`); add revoke/resend mutations; rate limit invite sending |
| `app/ConvexClientProvider.tsx` | Replace ClerkProvider with two-layer ConvexAuth providers; add `PostHogIdentifyUser` inside `Authenticated` |
| `app/layout.tsx` | Add `@vercel/analytics`, `@vercel/speed-insights`, Sentry providers, `PostHogProvider`, `PostHogPageView` |
| `app/t/[teamSlug]/hooks.ts` | Re-export `useTrack`, `useFeatureFlag` from `lib/hooks/` |
| `app/t/[teamSlug]/layout.tsx` | Add navigation for notes, AI, billing |
| `app/t/TeamMenu.tsx` | Expand navigation items |
| `middleware.ts` | Replace Clerk middleware with `createRouteMatcher` redirect logic |
| `next.config.mjs` | Add `@next/mdx` or `contentlayer2` config; Sentry webpack plugin; source map upload; PostHog reverse proxy rewrites (`/ph/*`) |
| `app/t/[teamSlug]/layout.tsx` | Add `PostHogTeamIdentify` for team-level group analytics |
| `convex/users/teams/members.ts` | Add `transferOwnership` mutation (confirm → update role edges → audit log → notify via email) |
| `package.json` | Add @convex-dev/auth, @convex-dev/polar, @convex-dev/rate-limiter, ai, @ai-sdk/*, next-themes, react-email, @vercel/analytics, @vercel/speed-insights, @sentry/nextjs, @next/mdx (or contentlayer2), posthog-js, posthog-node, @samhoque/convex-posthog |
| `tailwind.config.ts` | Dark mode support |
| `lib/planConfig.ts` | Add `storageQuotaMB` to tier limits |

---

## Implementation Phases

### Phase 1: Foundation (P0) — Batch 1 (parallel)
- [ ] **F001-001:** Convex Auth Migration + Magic Link
  - Replace Clerk with Convex Auth (two-layer provider pattern)
  - Add Password + ResendOTP providers
  - New auth pages (sign-in with email/password + magic link, sign-up, forgot-password)
  - `afterUserCreatedOrUpdated` callback for auto personal team creation
  - `createRouteMatcher` middleware for route protection
  - Update ConvexClientProvider, middleware, user store
  - Session management: query `authSessions` table, "Active sessions" list, "Log out all devices"
  - Timezone preference: `user.timezone` field (IANA), dropdown in profile settings
  - Verify all existing flows work with new auth
- [ ] **F001-002:** Design System Expansion — **DONE**
  - ~~Add 10+ shadcn/ui components~~
  - ~~Build 14 app-level components (including marketing components)~~
  - ~~Dark mode support via next-themes~~
- [ ] **F001-014:** Production Infrastructure
  - Sentry integration (optional, env-var gated) — client, server, edge
  - Vercel Analytics + Speed Insights (2 components in root layout)
  - Sentry tunnel route (`/monitoring`) to avoid ad-blockers
  - Preview seed data function (`convex/seedPreview.ts`)
  - Deployment documentation (`docs/deployment.md`)
  - `convex/crons.ts`: expired invite cleanup (daily), monthly credit resets, hourly subscription sync, stale session cleanup (daily)
  - `@convex-dev/rate-limiter` setup: token bucket + fixed window, team-scoped
- [ ] **F001-016:** Testing & Quality Infrastructure
  - Vitest + convex-test for unit/integration tests
  - Playwright + axe-playwright for E2E + accessibility tests
  - GitHub Actions CI pipeline (type-check, lint, test, e2e)
  - Husky + lint-staged pre-commit hooks
  - Seed test files for permissions, plan config, auth, accessibility
  - Tightened ESLint rules (`no-explicit-any: warn`, `no-unused-vars: error`)

### Phase 2: Monetization + Marketing (P1) — Batch 2 (parallel)
- [ ] **F001-003:** Polar Billing + Credit System
  - Convex component registration
  - Webhook handling via HTTP routes with `onSubscriptionUpdated` callback
  - `getUserInfo` mapped to team for team-level billing
  - Billing settings page with `CheckoutLink`/`CustomerPortalLink`
  - Configurable entitlement system with credit-based consumption
  - Credit decrement per AI request (model-specific cost)
- [ ] **F001-009:** Analytics & Event Tracking (PostHog)
  - PostHog client/server setup with env-var gating + reverse proxy
  - `useTrack()` hook wrapping `posthog.capture()`
  - `PostHogProvider`, `PostHogPageView`, identify/group integration
  - Server-side tracking from Convex via `@samhoque/convex-posthog`
- [ ] **F001-012:** Marketing Site & Legal Pages
  - Landing page: HeroSection, FeaturesGrid, PricingTable, FAQAccordion, CTASection
  - PricingTable auto-populated from `planConfig.ts`
  - `/pricing` dedicated pricing page
  - `/contact` form with Resend integration
  - `/legal/terms`, `/legal/privacy`, `/legal/cookies` (MDX templates)
  - Marketing layout with nav + footer
- [ ] **F001-017:** File Storage & Uploads
  - `<FileUploader>` component: drag-drop, progress bar, type validation, size limit
  - `convex/storage.ts`: `generateUploadUrl`, `deleteFile`, `getFileUrl` mutations
  - Avatar uploads for user profile + team settings (via `avatarStorageId`)
  - Storage quota per tier in `planConfig.ts` (`storageQuotaMB`)
  - Entitlement check before upload

### Phase 3: RBAC (P1) — Batch 3
- [ ] **F001-004:** Enhanced RBAC
  - Owner role + 9 new permissions
  - Custom roles (Enterprise tier)
  - Preserve existing permission API
  - Ownership transfer: `transferOwnership` mutation + confirmation dialog + email notification
  - Invite management: 7-day TTL (via `ctx.scheduler.runAt()`), revoke/resend buttons, rate limiting
  - Team avatar upload (uses F001-017 file storage)

### Phase 4: Product Features (P2) — Batch 4 (parallel)
- [ ] **F001-005:** AI/LLM Integration (Dual Streaming)
  - **Default:** Next.js API route (`app/api/ai/chat/route.ts`) — Vercel Edge Function
  - **Alternative:** Convex HTTP action (`convex/http.ts`) — documented as option
  - Both share Convex mutations for saving messages + tracking credits
  - Usage tracking + rate limiting + credit decrement
  - AI chat page with useChat
- [ ] **F001-006:** Notification System
  - In-app notifications (real-time)
  - 8-12 branded React Email templates: welcome, invite sent/accepted, subscription changed, payment failed/received, approaching limit, member removed
  - Shared email layout component (brand header + footer)
  - Email preview dev route (`/dev/emails`) for local development
  - Notification preferences
- [ ] **F001-007:** Onboarding System
  - Multi-step wizard
  - Progress tracking
- [ ] **F001-008:** Feature Flags (PostHog)
  - `useFeatureFlag()` hook wrapping PostHog's `useFeatureFlagEnabled()`
  - Admin flag management UI at `/admin/flags` (proxies PostHog REST API)
  - `useFeatureFlagWithPayload()` for JSON payload flags
- [ ] **F001-011:** Example App (Notes CRUD)
  - Full CRUD with permissions
  - Search, pagination, soft deletion
  - Entitlement gating
  - File attachments on notes (uses F001-017 file storage)
  - Command palette (Cmd+K): `<CommandPalette>` via shadcn `Command` + Convex search indexes on notes, teams, members
- [ ] **F001-013:** Blog & Changelog (MDX)
  - MDX files in `content/blog/` and `content/changelog/`
  - `@next/mdx` or `contentlayer2` for MDX processing
  - Static generation at build time (zero runtime cost)
  - Blog listing, individual post, changelog listing pages
  - Auto-generated sitemap entries
  - RSS feed generation
  - Changelog email subscription: `changelogSubscribers` table, subscribe/unsubscribe mutations, email on new entry
  - "What's New" badge: `<WhatsNewBadge>` in app header, dismissible, tracks last-seen changelog date

### Phase 5: Operations (P3) — Batch 5 (parallel)
- [ ] **F001-010:** Super Admin Panel
  - Dashboard, user/team management
  - Feature flag management (proxies PostHog API via `/api/posthog/flags/`)
  - Analytics page links to PostHog dashboard (no custom analytics UI)
  - Audit log (Convex-native `auditLog` table)
  - Waitlist management section
  - User impersonation: "View as User" button, `<ImpersonationBanner>` with "Viewing as [Name] — Exit", read-only mode, 30-min auto-expire, audit log every impersonation
- [ ] **F001-015:** Waitlist / Pre-Launch Mode
  - `waitlist_mode` feature flag controls pre-launch mode
  - `/waitlist` public page with email collection form
  - `waitlistEntries` table (email, status: pending/approved/rejected)
  - Admin panel section to review, approve, reject entries
  - Approved users get email invitation via Resend
  - When flag is off, app functions normally

---

## Acceptance Criteria (Testable)

### Auth (F001-001)
- [ ] User can sign up with email/password and is redirected to dashboard
- [ ] User can sign in with existing email/password and is redirected to dashboard
- [ ] User can sign in via magic link (Resend OTP) — receives branded email, clicks link, is authenticated
- [ ] Sign-in page shows both options: email/password form and "Sign in with email link" button
- [ ] `afterUserCreatedOrUpdated` callback auto-creates personal team on first sign-up
- [ ] User can reset password via forgot-password flow
- [ ] Existing team/member/invite flows work identically after migration
- [ ] No Clerk dependencies remain in package.json or codebase
- [ ] User can view active sessions (device, last active timestamp) in profile settings
- [ ] User can "Log out all other devices" (invalidates all sessions except current)
- [ ] User can set timezone preference (IANA timezone dropdown in profile settings)
- [ ] Dates throughout the app render in the user's selected timezone

### Design System (F001-002)
- [ ] All 10 new shadcn/ui components are installed and importable
- [ ] PageHeader, DataTable, EmptyState, StatusBadge render correctly
- [ ] Dark/light/system theme toggle works across all pages

### Billing (F001-003)
- [ ] Team admin can view billing page with current plan
- [ ] Polar checkout flow creates subscription and updates team tier
- [ ] `getUserInfo` returns team-level identity for Polar (team._id + owner email)
- [ ] Webhook `onSubscriptionUpdated` correctly updates subscriptionTier and subscriptionStatus
- [ ] Idempotent webhook handling (timestamp-based stale detection via `@convex-dev/polar`)
- [ ] checkEntitlement correctly enforces member limits per tier
- [ ] Credit-based entitlement: AI requests decrement credits based on model/token usage
- [ ] Dashboard shows credit usage meter (used/remaining for current period)
- [ ] Free tier teams have appropriate feature restrictions

### RBAC (F001-004)
- [ ] Owner role exists and can perform all actions
- [ ] Owner cannot leave team without transferring ownership
- [ ] New permissions are enforceable via existing viewerHasPermissionX API
- [ ] Custom roles can be created on Enterprise tier
- [ ] Ownership transfer: Owner can transfer to any existing team member via confirmation dialog
- [ ] Ownership transfer triggers email notification to both old and new owner
- [ ] Invites expire after 7 days (auto-deleted via scheduled function)
- [ ] Admin can revoke pending invites and resend expired invites
- [ ] Invite sending is rate-limited (via `@convex-dev/rate-limiter`)
- [ ] Team avatar can be uploaded and displays in sidebar and invite pages

### AI (F001-005)
- [ ] AI chat page renders with streaming responses
- [ ] Default streaming via Next.js API route (`/api/ai/chat`) works on Vercel Edge
- [ ] Alternative streaming via Convex HTTP action is documented and functional
- [ ] Both patterns share the same Convex mutations for saving messages and tracking usage
- [ ] Usage is tracked per team per billing period in credits
- [ ] Rate limiting prevents exceeding tier credit quota
- [ ] "Use AI" permission gates access

### Notifications (F001-006)
- [ ] In-app notification bell shows unread count
- [ ] Clicking notification marks as read
- [ ] Email notifications sent for key events (invite, subscription change)
- [ ] 8+ React Email templates exist: welcome, invite sent, invite accepted, subscription changed, payment failed, payment received, approaching limit, member removed
- [ ] All emails use shared layout with brand header and footer
- [ ] Email preview route (`/dev/emails`) renders all templates with sample data (dev only)
- [ ] Notification preferences allow users to toggle email vs in-app per notification type

### Onboarding (F001-007)
- [ ] New user sees onboarding wizard after first sign-up
- [ ] Wizard tracks completed steps across sessions
- [ ] User can skip onboarding

### Feature Flags (F001-008) — PostHog
- [ ] `useFeatureFlag(key)` returns correct boolean value from PostHog
- [ ] `useFeatureFlag(key)` returns `false` when PostHog is not configured (graceful degradation)
- [ ] `useFeatureFlagWithPayload(key)` returns JSON payload for flags with payloads
- [ ] Admin can list, create, toggle, and delete flags via `/admin/flags` (proxies PostHog API)
- [ ] `POSTHOG_PERSONAL_API_KEY` is never exposed to client-side code
- [ ] Flag management API routes verify `isSuperAdmin` before proxying

### Analytics (F001-009) — PostHog
- [ ] `useTrack(event, properties?)` fires events that appear in PostHog dashboard
- [ ] `useTrack()` is a no-op when PostHog is not configured
- [ ] PostHog reverse proxy works: network tab shows requests to `/ph/` not `us.i.posthog.com`
- [ ] `posthog.identify()` links events to authenticated users after auth resolves
- [ ] `posthog.group("team", teamId)` enables team-level analytics
- [ ] Manual pageview capture works with App Router navigation
- [ ] App works without errors when `NEXT_PUBLIC_POSTHOG_KEY` is not set

### Super Admin (F001-010)
- [ ] Super admin can access /admin routes
- [ ] Non-super-admin users are blocked from /admin
- [ ] Dashboard shows user, team, and revenue metrics
- [ ] Admin actions are logged to auditLog table (Convex-native)
- [ ] Feature flag management at `/admin/flags` proxies PostHog REST API
- [ ] Analytics page links to PostHog dashboard (no custom charts)
- [ ] Admin can impersonate any user via "View as User" button in user list
- [ ] Impersonation shows `<ImpersonationBanner>`: "Viewing as [Name] — Exit"
- [ ] Impersonation is read-only (mutations blocked or flagged)
- [ ] Impersonation auto-expires after 30 minutes
- [ ] Every impersonation start/stop is logged to auditLog

### Example App (F001-011)
- [ ] Notes CRUD works with real-time updates
- [ ] Permission-gated: Contribute can create, Manage Content can delete others'
- [ ] Search works across note titles and content
- [ ] Entitlement gating limits notes per tier
- [ ] Notes support file attachments (upload via `<FileUploader>`, stored as `attachmentStorageIds`)
- [ ] Command palette (Cmd+K) opens `<CommandPalette>` dialog
- [ ] Command palette searches notes, teams, and members via Convex search indexes
- [ ] Command palette shows recent items and navigation shortcuts
- [ ] Selecting a search result navigates to the appropriate page

### Marketing Site & Legal Pages (F001-012)
- [ ] Landing page renders with hero, features grid, pricing table, FAQ, and CTA sections
- [ ] PricingTable auto-populates from `planConfig.ts` and highlights recommended plan
- [ ] `/pricing` page works as standalone pricing comparison
- [ ] `/contact` form validates input and sends email via Resend
- [ ] `/legal/terms`, `/legal/privacy`, `/legal/cookies` render MDX content correctly
- [ ] Marketing pages are fully responsive (mobile/tablet/desktop)
- [ ] Marketing layout has distinct nav/footer from authenticated app layout

### Blog & Changelog (F001-013)
- [ ] Blog listing page shows all posts sorted by date
- [ ] Individual blog posts render MDX content with proper typography
- [ ] Changelog page shows entries in reverse chronological order
- [ ] MDX frontmatter validates at build time (title, date, description required)
- [ ] Blog and changelog pages are statically generated at build time
- [ ] RSS feed is generated at `/blog/feed.xml`
- [ ] Visitors can subscribe to changelog updates via email (stored in `changelogSubscribers` table)
- [ ] Duplicate changelog email subscription shows "already subscribed" message
- [ ] Subscribers can unsubscribe via link in changelog email
- [ ] `<WhatsNewBadge>` in app header shows dot indicator when new changelog entries exist since user last dismissed
- [ ] Clicking the badge opens the changelog; dismissing updates user's last-seen timestamp

### Production Infrastructure (F001-014)
- [ ] Sentry captures client-side and server-side errors when `NEXT_PUBLIC_SENTRY_DSN` is set
- [ ] App runs without errors when Sentry env vars are not set (graceful degradation)
- [ ] Sentry tunnel route (`/monitoring`) forwards events to avoid ad-blockers
- [ ] `@vercel/analytics` tracks page views in Vercel dashboard
- [ ] `@vercel/speed-insights` reports Core Web Vitals (LCP, FID, CLS, TTFB, INP)
- [ ] PostHog reverse proxy configured in `next.config.js` (`/ph/*` rewrites)
- [ ] PostHog gracefully disabled when `NEXT_PUBLIC_POSTHOG_KEY` is not set
- [ ] `convex/seedPreview.ts` populates demo data (team, users, notes, sample content)
- [ ] `docs/deployment.md` covers Vercel setup, env vars (including PostHog), preview deploys, custom domains
- [ ] `convex/crons.ts` exists with 4+ recurring jobs (invite cleanup, credit reset, subscription sync, session cleanup)
- [ ] Cron jobs appear in Convex dashboard and execute on schedule
- [ ] `@convex-dev/rate-limiter` is installed and configured for team-scoped rate limiting
- [ ] Rate limiter used in invite sending and AI request mutations

### Waitlist / Pre-Launch Mode (F001-015)
- [ ] When `waitlist_mode` feature flag is enabled, unauthenticated users see `/waitlist` instead of landing page
- [ ] Waitlist form accepts email and stores in `waitlistEntries` with status "pending"
- [ ] Duplicate email submission shows "already on waitlist" message
- [ ] Admin panel shows pending waitlist entries with approve/reject actions
- [ ] Approved users receive invitation email via Resend
- [ ] When `waitlist_mode` flag is disabled, app functions normally (landing page visible)

### Testing & Quality Infrastructure (F001-016)
- [ ] `npm run test` runs Vitest unit/integration tests and passes
- [ ] `npm run test:e2e` runs Playwright E2E tests (requires dev server)
- [ ] `npm run test:coverage` generates V8 coverage report
- [ ] `npm run type-check` runs TypeScript strict check
- [ ] Git commit triggers pre-commit hooks (lint-staged with ESLint, Prettier, related tests)
- [ ] `.github/workflows/ci.yml` runs on push/PR: type-check, lint, unit tests, E2E tests
- [ ] Seed test files exist for permissions, plan config, auth E2E, and accessibility
- [ ] ESLint rules tightened: `no-explicit-any: warn`, `no-unused-vars: error`
- [ ] ARCHITECTURE.md contains system design, data model, and key flows
- [ ] `docs/adrs/` has 8 Architecture Decision Records
- [ ] CONTRIBUTING.md documents dev setup, testing, PR process

### File Storage & Uploads (F001-017)
- [ ] `<FileUploader>` component renders with drag-drop zone, progress bar, and type/size validation
- [ ] Files upload directly to Convex storage via signed URL (no server relay)
- [ ] User can upload/change their profile avatar; avatar displays in sidebar and profile
- [ ] Team admin can upload/change team avatar; team avatar displays in sidebar, emails, and invite pages
- [ ] Notes support adding file attachments (images, PDFs, CSVs)
- [ ] File attachments display inline or as download links depending on type
- [ ] Storage quota is enforced per tier (via `checkEntitlement` with `storageQuotaMB`)
- [ ] Upload rejected with clear error when file type is not in allowlist
- [ ] Upload rejected with clear error when file exceeds size limit
- [ ] Files can be deleted (removes from Convex storage and entity reference)

---

## Success Definition

1. **Developer clones repo → working SaaS in 30 min:** Auth, billing, teams, marketing site, and example app work after setting env vars
2. **All modules are independently removable:** Developer can delete any module (AI, notifications, blog, waitlist, etc.) without breaking core functionality
3. **Zero security holes:** All mutations check auth, permissions, and entitlements; webhooks verify HMAC; no client-side auth decisions
4. **TypeScript strict mode passes:** `npm run lint` and `npm run build` succeed with zero errors
5. **Real-time everything:** All data updates propagate instantly via Convex subscriptions
6. **Production-ready deployment:** One-click Vercel deploy with error monitoring, performance tracking, and preview environments
7. **Polished first impression:** Marketing site, pricing page, and blog make the boilerplate look like a finished product from day one

---

## Cost Impact

| Service | Free Tier | Pro Tier Estimate |
|---------|-----------|-------------------|
| Convex | 1M function calls/mo | ~$25/mo at scale |
| Polar | No platform fee | % per transaction |
| OpenAI/Anthropic | N/A (user provides key) | $0.01-0.10/request |
| Resend | 3,000 emails/mo | $20/mo at scale |
| Vercel | Hobby (free) | Pro $20/mo per member |
| Vercel Analytics | Free (included) | Free (included with Vercel) |
| Vercel Speed Insights | Free tier available | $10/mo for more data points |
| Sentry | 5K errors/mo (free) | $26/mo (Team plan) |
| PostHog | 1M events + 1M flags/mo | Usage-based at scale |

AI costs are pass-through — the boilerplate tracks usage via credits but each deployer configures their own API keys and credit pricing per model. Blog/changelog are static MDX (zero runtime cost).

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Convex Auth SSR limitations | High | Medium | Use client-side auth checks; avoid server-side fetchMutation for auth |
| Polar API changes | Low | Medium | Pin @convex-dev/polar version; abstract behind billing.ts |
| convex-ents compatibility with authTables | Medium | High | Test schema integration early; fall back to manual auth tables if needed |
| Feature scope creep per module | Medium | Medium | Strict acceptance criteria; each module is independently shippable |
| Migration breaks existing deployments | Low | High | Document migration path from v1; provide upgrade script |
| Resend OTP delivery delays | Medium | Low | Magic link is optional; email/password always available as fallback |
| MDX build failures on Vercel | Low | Medium | Validate frontmatter schema; use TypeScript-checked content layer |
| Sentry bundle size impact | Low | Low | Tree-shaking + env-var gating; Sentry is fully optional |
| Credit calculation accuracy | Medium | Medium | Conservative estimates before streaming; reconcile after completion; audit trail |
| Preview deploy seed data conflicts | Low | Low | Idempotent seed function; checks for existing data before inserting |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-10 | Convex Auth over Clerk | Single source of truth; eliminates external dependency; simplifies deployment |
| 2026-02-10 | Email/password only (no OAuth) | Keeps auth setup simple — no external provider config. OAuth can be added later via Convex Auth providers. |
| 2026-02-10 | Configurable entitlements (not hardcoded tiers) | Each project defines its own tiers — boilerplate provides plumbing, not business logic |
| 2026-02-10 | Team-level billing (not per-user) | Matches B2B SaaS model (Slack, Notion, Linear) |
| 2026-02-10 | AI via Vercel AI SDK | Provider-agnostic; swap OpenAI/Anthropic via config; built-in streaming |
| 2026-02-10 | ~~Feature flags in Convex~~ → PostHog | PostHog provides flags + analytics + session replay + A/B testing. Generous free tier. See [ADR-008](../adrs/008-posthog-analytics-flags.md). |
| 2026-02-10 | Replace messages with notes CRUD | Richer reference implementation demonstrating more patterns |
| 2026-02-10 | Owner/Admin/Member (3 fixed roles) | Owner is transferable highest-privilege; custom roles opt-in for Enterprise |
| 2026-02-10 | Super admin via isSuperAdmin boolean | Simple, orthogonal to team roles, easy to check |
| 2026-02-10 | ~~First-party analytics~~ → PostHog analytics | PostHog provides funnels, retention, session replay. Eliminates custom aggregation code. See [ADR-008](../adrs/008-posthog-analytics-flags.md). |
| 2026-02-10 | Add magic link auth (Resend OTP) | Convex Auth supports it natively; better UX for some users; no additional service needed (Resend already in stack) |
| 2026-02-10 | Credit-based AI billing (not just request count) | Different models have vastly different costs; credits give developers flexibility to price fairly |
| 2026-02-10 | Dual AI streaming patterns | Next.js API route is standard Vercel pattern (default); Convex HTTP action is better for teams wanting everything on Convex. Ship both, document trade-offs. |
| 2026-02-10 | Modular marketing site (not separate repo) | Landing page IS the product for a boilerplate. Developers judge starters by their demo site. Shared components reduce duplication. |
| 2026-02-10 | MDX for blog/legal (not CMS) | Zero runtime cost; version-controlled; no third-party dependency. Developers can swap for CMS later. |
| 2026-02-10 | Sentry for error monitoring (optional) | Industry standard; Vercel marketplace integration; AI SDK telemetry support. Env-var gated = zero impact when disabled. |
| 2026-02-10 | Vercel Analytics + Speed Insights | Free, 2 lines of code, Core Web Vitals. Complements first-party business analytics. |
| 2026-02-10 | Waitlist as feature-flag-gated mode | Simple toggle for pre-launch; reuses existing feature flag + notification infrastructure; no separate deployment needed. |
| 2026-02-10 | Deploy on Vercel (not self-hosted) | GitHub auto-deploy; preview deploys per PR; edge functions; marketplace integrations. Standard for Next.js. |
| 2026-02-10 | Skip i18n, Figma, plugin system, monorepo | Scope control. These add complexity without clear benefit for a boilerplate. Can be added by the developer. |
| 2026-02-10 | Skip MFA (TOTP) for now | Medium complexity; important for B2B but can be added as future enhancement. |
| 2026-02-10 | Skip feedback widget for now | Low value for a boilerplate; developers can add their own. |
| 2026-02-10 | Add F001-016 Testing & Quality Infrastructure as P0 | When AI writes 100% of code, automated testing is the #1 regression prevention tool. Vitest + Playwright + CI/CD + pre-commit hooks. |
| 2026-02-10 | Vitest over Jest | ESM-native, TypeScript OOTB, faster, better DX. convex-test pairs with Vitest. |
| 2026-02-10 | Tighten ESLint for AI-generated code | `no-explicit-any: warn` and `no-unused-vars: error` catch common AI code quality issues. |
| 2026-02-11 | Add F001-017 File Storage & Uploads as P1 | Convex has built-in file storage (`ctx.storage.*`) — no S3/Cloudinary needed. Avatar uploads and note attachments are table stakes. Low backend effort, mostly UI (`<FileUploader>` component). |
| 2026-02-11 | Add cron jobs to F001-014 | Convex `cronJobs()` is built-in — just needs a file. Every SaaS needs recurring housekeeping (invite cleanup, credit resets, subscription sync). ~30 min of work. |
| 2026-02-11 | Add rate limiter to F001-014 | `@convex-dev/rate-limiter` provides type-safe, transactional rate limiting (token bucket + fixed window). Better than Redis-based solutions for Convex. |
| 2026-02-11 | Expand F001-006 with email template library | Production SaaS needs 8-12 transactional emails. React Email templates with shared brand layout. Email preview dev route for DX. |
| 2026-02-11 | Add command palette to F001-011 | shadcn `Command` component already installed + Convex built-in search. Expected UX in 2026. Low effort to wire up. |
| 2026-02-11 | Add impersonation to F001-010 | #1 most-requested admin feature in competing boilerplates. Read-only with audit trail. Critical for customer support. |
| 2026-02-11 | Expand F001-004 with ownership transfer + invite management | Ownership transfer is mentioned in edge cases but had no UI/mutation. Invite expiration/revoke/resend improves invite lifecycle management. |
| 2026-02-11 | Expand F001-013 with changelog subscriptions | "What's New" badge + email subscription improves user re-engagement. `changelogSubscribers` table is trivial. |
| 2026-02-11 | ~~File upload out of scope~~ → F001-017 | Moved from "Out of Scope" because Convex built-in storage makes it low-effort. Avatar uploads are baseline for any SaaS. |

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
      aiCredits: 100,      // credits per billing period
      notes: 50,
      storageQuotaMB: 100, // 100 MB file storage
    },
    features: ["basic", "notes"],
  },
  pro: {
    displayName: "Pro",
    price: 29,
    limits: {
      members: 20,
      aiCredits: 5000,
      notes: -1, // unlimited
      storageQuotaMB: 5000, // 5 GB
    },
    features: ["basic", "notes", "ai", "api", "analytics"],
  },
  enterprise: {
    displayName: "Enterprise",
    price: 99,
    limits: {
      members: -1,
      aiCredits: -1,       // unlimited
      notes: -1,
      storageQuotaMB: -1,  // unlimited
    },
    features: ["basic", "notes", "ai", "api", "analytics", "custom-roles", "sso"],
  },
} as const;

// Credit costs per AI model
export const AI_CREDIT_COSTS = {
  "gpt-4o": 10,
  "gpt-4o-mini": 2,
  "claude-sonnet-4-5-20250929": 8,
  "claude-haiku-4-5-20251001": 2,
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
  (DONE, no deps)         │                          ├──→ F001-008 (Feature Flags) ──→ F001-015 (Waitlist)
                          │                          └──→ F001-011 (Notes) ← also depends on F001-017
F001-014 (Prod Infra)     │
  (parallel, no deps)     ├──→ F001-004 (RBAC) ──────┬──→ F001-005 (AI)
                          │     ↑ also F001-017       ├──→ F001-011 (Notes)
F001-016 (Testing)        │                          └──→ F001-010 (Admin)
  (parallel, no deps)     │
                          └──→ F001-009 (Analytics) ─┬──→ F001-010 (Admin)
F001-012 (Marketing)                                 │
  ← depends on F001-002   F001-008 (Feature Flags) ──┘

F001-017 (File Storage) ← depends on F001-002
F001-013 (Blog) ← depends on F001-012
F001-015 (Waitlist) ← depends on F001-008, F001-006
```

### D. Build Sequence

```
Batch 1 (parallel): F001-001 (Auth) + F001-002 (DONE) + F001-014 (Prod Infra) + F001-016 (Testing)
Batch 2 (parallel): F001-003 (Billing) + F001-009 (Analytics) + F001-012 (Marketing Site) + F001-017 (File Storage)
Batch 3:            F001-004 (RBAC)
Batch 4 (parallel): F001-005 (AI) + F001-006 (Notifications) + F001-007 (Onboarding)
                   + F001-008 (Feature Flags) + F001-011 (Notes) + F001-013 (Blog)
Batch 5 (parallel): F001-010 (Super Admin) + F001-015 (Waitlist)
```

### E. Vercel Deployment Configuration

**Auto-deploy:** GitHub → Vercel integration (repo connected in Vercel dashboard).

**Build command override (set in Vercel UI):**
```
npx convex deploy --cmd 'npm run build'
```

**Preview deploys:** Each PR gets an isolated Convex backend (auto-cleaned after 5-14 days).
```
npx convex deploy --cmd 'npm run build' --preview-run 'seedPreview'
```

**Environment Variables — Vercel Dashboard:**

| Variable | Scope | Notes |
|----------|-------|-------|
| `CONVEX_DEPLOY_KEY` | Production + Preview (separate keys) | Enables `convex deploy` in CI |
| `SENTRY_AUTH_TOKEN` | Production + Preview | Source map upload during build |
| `NEXT_PUBLIC_SENTRY_DSN` | Production + Preview | Optional — Sentry disabled if not set |
| `NEXT_PUBLIC_POSTHOG_KEY` | Production + Preview | PostHog client-side project key (optional — disabled if not set) |
| `POSTHOG_API_KEY` | Production + Preview | PostHog server-side project key |
| `POSTHOG_PERSONAL_API_KEY` | Production only | PostHog admin flag management API key |
| `POSTHOG_PROJECT_ID` | Production only | PostHog project ID for management API URLs |
| `NEXT_PUBLIC_CONVEX_URL` | — | Auto-set by `convex deploy` — do NOT set manually |

**Environment Variables — Convex Dashboard:**

| Variable | Notes |
|----------|-------|
| `SITE_URL` | Public URL for email links (e.g., `https://yourapp.com`) |
| `CONVEX_AUTH_PRIVATE_KEY` | Convex Auth signing key |
| `POLAR_ACCESS_TOKEN` | Polar API access token |
| `POLAR_WEBHOOK_SECRET` | Polar webhook HMAC secret |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) |
| `RESEND_API_KEY` | Resend email API key |
| `HOSTED_URL` | Public URL for email links (same as SITE_URL) |
| `POSTHOG_API_KEY` | PostHog server-side project key (for Convex actions) |
| `POSTHOG_HOST` | PostHog host URL (defaults to `https://us.i.posthog.com`) |

**Key notes:**
- Webhooks (Polar, etc.) hit `.convex.site` directly — not through Vercel
- AI streaming default is via Next.js API route on Vercel Edge; Convex HTTP action is documented alternative
- Custom domains configured in Vercel dashboard (Next.js) and Convex dashboard (HTTP actions)

### F. Reference Repos for Implementation

| Module | Primary Reference | License | Key Patterns |
|--------|------------------|---------|-------------|
| Auth (F001-001) | `get-convex/template-nextjs-convexauth-shadcn` | Official | Two-layer provider, `createRouteMatcher` middleware, `getAuthUserId()` |
| Auth callbacks | `arjunkambj/next-convex-saas-starter-kit` | Unlicensed (reference only) | `afterUserCreatedOrUpdated` callback for auto-team creation |
| Billing (F001-003) | `get-convex/polar` | Apache-2.0 | `registerRoutes`, webhook callbacks, `CheckoutLink`/`CustomerPortalLink`, idempotent webhooks |
| Billing (F001-003) | `michaelshimeles/react-starter-kit` | Unlicensed (reference only) | Real-world Polar + Convex usage |
| AI (F001-005) | `Syed-Ahmed02/nextjs-convex-clerk-ai-template` | Unlicensed (reference only) | Vercel AI SDK + Convex streaming patterns |
| Design System (F001-002) | `ixartz/SaaS-Boilerplate` | MIT | shadcn/ui dashboard layout, data tables, settings pages |
| Analytics + Flags (F001-008/009) | `PostHog/posthog-js` | MIT | PostHog JS client, React provider, hooks |
| Convex PostHog (F001-009) | `@samhoque/convex-posthog` | MIT | Server-side PostHog tracking from Convex mutations |
| Email (F001-006) | `jordanliu/convex-starter` | Unlicensed (reference only) | React Email + Convex patterns |

**Key Patterns to Adopt:**
1. Two-layer auth provider — `ConvexAuthNextjsServerProvider` (server) + `ConvexAuthNextjsProvider` (client)
2. Route matcher middleware — `createRouteMatcher(["/t(.*)"])` for clean protected route definitions
3. Auth callbacks — `afterUserCreatedOrUpdated` for auto-creating personal team on signup
4. Polar `getUserInfo` mapped to team — return `{ userId: team._id, email: ownerEmail }` for team-level billing
5. Polar webhook callbacks — `onSubscriptionUpdated` to sync `subscriptionTier` on teams
6. Idempotent webhook handling — timestamp-based stale webhook detection (built into `@convex-dev/polar`)

**Patterns to Explicitly AVOID:**
- `.filter()` instead of `.withIndex()` (causes full table scans)
- Members stored as array on org (doesn't scale — we correctly use join table)
- Role stored on user not membership (breaks multi-team roles)
- Empty middleware with no route protection (causes flash of protected content)

### G. New Package Dependencies

```json
{
  "dependencies": {
    "@convex-dev/auth": "latest",
    "@convex-dev/polar": "latest",
    "@convex-dev/rate-limiter": "latest",
    "ai": "latest",
    "@ai-sdk/openai": "latest",
    "@ai-sdk/anthropic": "latest",
    "next-themes": "latest",
    "@react-email/components": "latest",
    "resend": "latest",
    "@vercel/analytics": "latest",
    "@vercel/speed-insights": "latest",
    "@next/mdx": "latest",
    "@mdx-js/react": "latest",
    "posthog-js": "latest",
    "posthog-node": "latest",
    "@samhoque/convex-posthog": "latest"
  },
  "optionalDependencies": {
    "@sentry/nextjs": "latest"
  }
}
```
