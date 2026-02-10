# Architecture — SaaS Starter Kit V2

## Overview

Multi-tenant SaaS boilerplate built on Next.js 14 (App Router), Convex (realtime backend + auth), shadcn/ui, and Resend. Designed for B2B SaaS products with team-level billing, RBAC, AI integration, and admin tooling.

See `docs/prds/F001-saas-boilerplate-v2.md` for the full PRD. See `docs/adrs/` for architecture decisions.

---

## System Architecture

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
│  ├─ helpers/ResendOTP.ts (Magic link email provider)              │
│  ├─ users/teams/         (Team CRUD, members, invites)            │
│  ├─ notes/               (Example CRUD app)                       │
│  ├─ ai/                  (AI conversations, usage, credits)       │
│  ├─ notifications/       (In-app + email)                         │
│  ├─ featureFlags/        (Flag definitions + overrides)           │
│  ├─ analytics/           (Event tracking)                         │
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
           ┌───────────┼───────────┬───────────┐
           ▼           ▼           ▼           ▼
      Polar API   OpenAI/Claude   Resend     Sentry
      (Billing)   (AI Providers)  (Email)    (Monitoring)
```

---

## Directory Structure

```
app/                        Next.js App Router pages & layouts
  (marketing)/              Public marketing pages (route group)
    page.tsx                Landing page (hero, features, pricing, FAQ, CTA)
    pricing/                Dedicated pricing page
    contact/                Contact form (Resend)
    legal/                  ToS, Privacy Policy, Cookie Policy (MDX)
  auth/                     Auth pages (sign-in, sign-up, forgot-password)
  blog/                     MDX blog listing + [slug] pages
  changelog/                MDX changelog listing
  waitlist/                 Pre-launch waitlist signup
  api/ai/chat/              Next.js API route for AI streaming (Vercel Edge)
  ConvexClientProvider.tsx  Two-layer ConvexAuth provider wrapper
  t/                        Authenticated routes (team context)
    [teamSlug]/             Per-team pages
      notes/                Example CRUD app
      ai/                   AI chat
      settings/
        billing/            Billing management
        members/            Member management
    onboarding/             Onboarding wizard
  admin/                    Super admin panel (incl. waitlist management)
  monitoring/               Sentry tunnel route
components/
  ui/                       shadcn/ui components (do not edit manually)
  PageHeader.tsx            Consistent page title + breadcrumb + actions
  DataTable.tsx             Configurable data table
  EmptyState.tsx            Standardized empty states
  StatusBadge.tsx           Status indicators
  PricingCard.tsx           Plan comparison
  UsageMeter.tsx            Usage bars
  StepWizard.tsx            Multi-step forms
  ThemeToggle.tsx           Dark/light/system
  HeroSection.tsx           Landing page hero
  FeaturesGrid.tsx          Feature cards grid
  PricingTable.tsx          Plan comparison table (reads planConfig.ts)
  FAQAccordion.tsx          Configurable Q&A pairs
  CTASection.tsx            Call-to-action banner
  ContactForm.tsx           Contact form with Resend
convex/                     Convex backend (see schema below)
content/
  blog/                     MDX blog posts
  changelog/                MDX changelog entries
  legal/                    MDX legal page templates (ToS, Privacy, Cookies)
lib/
  planConfig.ts             Configurable tier/entitlement/credit definitions
  mdx.ts                    MDX processing utilities
  utils.ts                  Shared utilities
tests/                      Vitest global setup
e2e/                        Playwright E2E tests
docs/
  prds/                     Product requirement documents
  adrs/                     Architecture decision records
  deployment.md             Vercel deployment guide
```

---

## Data Model (convex-ents)

### Core Entities

| Entity | Key Fields | Edges |
|--------|-----------|-------|
| users | email (unique), fullName, isSuperAdmin | members |
| teams | name, slug (unique), isPersonal, polarCustomerId, subscriptionTier, subscriptionStatus | messages, members, invites |
| members | searchable | team, user, role, messages |
| roles | name (Owner/Admin/Member), isDefault | permissions, members |
| permissions | name (14 permissions, unique) | roles |
| invites | email (unique), inviterEmail | team, role |

### Feature Entities

| Entity | Purpose | Edges |
|--------|---------|-------|
| notes | Example CRUD app | team, member |
| aiConversations | AI chat sessions | team, member |
| aiMessages | Individual AI messages | conversation |
| aiUsage | Credit tracking per team/period | team |
| notifications | In-app notifications | user |
| notificationPreferences | Per-user notification settings | user |
| onboardingProgress | Wizard step tracking | user |
| featureFlags | Global flag definitions | — |
| teamFeatureFlags | Per-team flag overrides | team, featureFlag |
| analyticsEvents | First-party event tracking | team, user |
| auditLog | Admin action audit trail | user |
| waitlistEntries | Pre-launch email collection | — |

### Key Constraints

- **Soft deletion:** users, teams, members, notes, aiConversations
- **Scheduled deletion:** teams have 7-day grace period
- **Unique fields:** users.email, teams.slug, roles.name, permissions.name, invites.email, featureFlags.key, waitlistEntries.email

### Permissions (14)

`Manage Team`, `Delete Team`, `Read Members`, `Manage Members`, `Contribute`, `Manage Billing`, `View Billing`, `Use AI`, `Manage AI Settings`, `View Analytics`, `Manage Integrations`, `Manage Feature Flags`, `Manage Content`, `View Content`

### Role → Permission Mapping

| Permission | Owner | Admin | Member |
|-----------|-------|-------|--------|
| Manage Team | Yes | Yes | — |
| Delete Team | Yes | — | — |
| Read Members | Yes | Yes | Yes |
| Manage Members | Yes | Yes | — |
| Contribute | Yes | Yes | Yes |
| Manage Billing | Yes | — | — |
| View Billing | Yes | Yes | — |
| Use AI | Yes | Yes | Yes |
| Manage AI Settings | Yes | Yes | — |
| View Analytics | Yes | Yes | — |
| Manage Integrations | Yes | — | — |
| Manage Feature Flags | Yes | — | — |
| Manage Content | Yes | Yes | — |
| View Content | Yes | Yes | Yes |

---

## Key Flows

### Auth Flow

```
User visits /auth/sign-in
  → Option A: Email/password sign-in via Convex Auth Password provider
  → Option B: Magic link sign-in via Convex Auth ResendOTP provider
  → Session created in Convex
  → ConvexAuthNextjsProvider detects session
  → afterUserCreatedOrUpdated callback: auto-creates personal team
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

### Permission Resolution

```
User attempts action (e.g., "Delete Note")
  → viewerWithPermissionX(ctx, teamId, "Manage Content")
  → Looks up member by (teamId, userId)
  → Traverses member → role → permissions edges
  → If permission found → allow
  → If not found → throw ConvexError("Viewer does not have permission")
```

### Entitlement Check

```
1. User action triggers mutation
2. Mutation calls checkEntitlement(ctx, teamId, "aiCredits")
3. checkEntitlement:
   a. Gets team.subscriptionTier (default: "free")
   b. Reads PLAN_CONFIG[tier].limits.aiCredits → totalCredits
   c. Queries aiUsage for current period → creditsUsed
   d. Returns { allowed, used, limit, remaining }
4. If not allowed → throw ConvexError with credit details + upgrade prompt
5. If allowed → proceed, then decrement credits based on model/token usage
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

### AI Streaming (Dual Pattern)

**Default — Next.js API Route (Vercel Edge):**
Client `useChat()` → POST `/api/ai/chat` → authenticate via Convex session → check permission + entitlement + rate limit → stream via Vercel AI SDK → save message + decrement credits on completion.

**Alternative — Convex HTTP Action:**
Client `useChat()` → POST to `.convex.site/api/ai/chat` → same checks → stream from Convex → schedule mutation to save + update credits.

Both share the same Convex mutations for message saving and credit tracking.

---

## Security Architecture

Three-layer enforcement:

### 1. Schema Layer
- Validators on all function args (Zod + Convex validators)
- Unique constraints on critical fields
- Soft deletion prevents accidental data loss

### 2. Runtime Layer
- `viewerX()` — authenticated user or throw
- `viewerHasPermissionX(ctx, teamId, permission)` — RBAC check or throw
- `checkEntitlement(ctx, teamId, key)` — tier-gating or throw
- `checkRateLimit(ctx, key, limit)` — token bucket rate limiting
- `requireSuperAdmin(ctx)` — super admin check or throw

### 3. Infrastructure Layer
- No client-side auth decisions
- All secrets in environment variables
- HMAC webhook verification (Polar)
- Sentry tunnel route to avoid ad-blockers

---

## Module Dependencies

```
F001-001 (Auth) ──────────┬──→ F001-003 (Billing) ──┬──→ F001-005 (AI)
                          │                          ├──→ F001-006 (Notifications)
F001-002 (Design System)  │                          ├──→ F001-007 (Onboarding)
  (parallel, no deps)     │                          ├──→ F001-008 (Feature Flags) ──→ F001-015 (Waitlist)
                          │                          └──→ F001-011 (Notes)
F001-014 (Prod Infra)     │
  (parallel, no deps)     ├──→ F001-004 (RBAC) ──────┬──→ F001-005 (AI)
                          │                          ├──→ F001-011 (Notes)
F001-016 (Testing)        │                          └──→ F001-010 (Admin)
  (parallel, no deps)     │
                          └──→ F001-009 (Analytics) ─┬──→ F001-010 (Admin)
F001-012 (Marketing)                                 │
  ← depends on F001-002   F001-008 (Feature Flags) ──┘

F001-013 (Blog) ← depends on F001-012
F001-015 (Waitlist) ← depends on F001-008, F001-006
```

### Build Sequence

```
Batch 1 (parallel): F001-001 (Auth) + F001-002 (Design System) + F001-014 (Prod Infra) + F001-016 (Testing)
Batch 2 (parallel): F001-003 (Billing) + F001-009 (Analytics) + F001-012 (Marketing Site)
Batch 3:            F001-004 (RBAC)
Batch 4 (parallel): F001-005 (AI) + F001-006 (Notifications) + F001-007 (Onboarding)
                   + F001-008 (Feature Flags) + F001-011 (Notes) + F001-013 (Blog)
Batch 5 (parallel): F001-010 (Super Admin) + F001-015 (Waitlist)
```

---

## Environment Variables

### Convex Dashboard

| Variable | Purpose |
|----------|---------|
| `SITE_URL` | Public URL for email links |
| `CONVEX_AUTH_PRIVATE_KEY` | Convex Auth signing key |
| `POLAR_ACCESS_TOKEN` | Polar API access token |
| `POLAR_WEBHOOK_SECRET` | Polar webhook HMAC secret |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) |
| `RESEND_API_KEY` | Resend email API key |
| `HOSTED_URL` | Public URL for email links |

### Vercel Dashboard

| Variable | Purpose |
|----------|---------|
| `CONVEX_DEPLOY_KEY` | Enables `convex deploy` in CI (separate prod + preview keys) |
| `SENTRY_AUTH_TOKEN` | Source map upload during build (optional) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking (optional — disabled if not set) |
| `NEXT_PUBLIC_CONVEX_URL` | Auto-set by `convex deploy` — do NOT set manually |

---

## Technology Decisions

See `docs/adrs/` for full rationale on each decision:

| Decision | Choice | ADR |
|----------|--------|-----|
| Authentication | Convex Auth (not Clerk) | [ADR-001](docs/adrs/001-convex-auth.md) |
| Billing | Polar, team-level | [ADR-002](docs/adrs/002-polar-billing.md) |
| Data model | convex-ents | [ADR-003](docs/adrs/003-convex-ents.md) |
| AI streaming | Dual pattern (Next.js API + Convex HTTP) | [ADR-004](docs/adrs/004-ai-dual-streaming.md) |
| Content | MDX (not CMS) | [ADR-005](docs/adrs/005-mdx-content.md) |
| Deployment | Vercel | [ADR-006](docs/adrs/006-vercel-deploy.md) |
| AI billing | Credit-based | [ADR-007](docs/adrs/007-credit-billing.md) |
