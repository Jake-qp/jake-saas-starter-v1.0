# CLAUDE.md — SaaS Starter Kit V2

## Project Overview

Multi-tenant SaaS boilerplate built on Next.js 14 (App Router), Convex (realtime backend + auth), shadcn/ui (components), and Resend (email). Production-grade with billing, AI, admin panel, feature flags, and analytics.

**Current state:** Migrating from V1 (Clerk auth, basic RBAC, messages demo) to V2 (Convex Auth, Polar billing, AI, admin, full feature set). See `docs/prds/F001-saas-boilerplate-v2.md` for the master PRD.

## Tech Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript
- **Backend:** Convex (realtime database + serverless functions)
- **Auth:** Convex Auth (`@convex-dev/auth`) — email/password (migrating from Clerk)
- **Billing:** Polar via `@convex-dev/polar` (team-level billing)
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`)
- **UI:** shadcn/ui (New York style), Tailwind CSS, Radix primitives, next-themes
- **Email:** Resend + React Email
- **Validation:** Zod
- **Forms:** react-hook-form

## Directory Structure

```
app/                        Next.js App Router pages & layouts
  auth/                     Auth pages (sign-in, sign-up, forgot-password)
  ConvexClientProvider.tsx   ConvexAuthProvider wrapper
  t/                        Authenticated routes (team context)
    [teamSlug]/             Per-team pages
      notes/                Example CRUD app
      ai/                   AI chat
      settings/
        billing/            Billing management
        members/            Member management
    onboarding/             Onboarding wizard
  admin/                    Super admin panel
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
convex/                     Convex backend
  auth.ts                   Convex Auth provider config
  schema.ts                 Data model (convex-ents + authTables)
  functions.ts              Custom query/mutation wrappers with auth
  permissions.ts            RBAC permission checks (~14 permissions)
  entitlements.ts           Tier/limit/feature-gate checks
  billing.ts                Polar integration
  http.ts                   HTTP routes (webhooks, AI streaming)
  convex.config.ts          Component registration (Polar)
  types.ts                  Custom context types
  users/teams/              Team, member, role functions
  notes/                    Notes CRUD
  ai/                       AI conversations, usage
  notifications/            In-app + email
  featureFlags/             Flag definitions + resolution
  analytics/                Event tracking
  admin/                    Super admin queries/mutations
lib/
  planConfig.ts             Configurable tier/entitlement definitions
  utils.ts                  Shared utilities
middleware.ts               Redirect-based auth middleware
docs/
  prds/                     Product requirement documents
```

## Data Model (convex-ents)

### Core Entities

| Entity | Key Fields | Edges |
|--------|-----------|-------|
| users | email, fullName, isSuperAdmin | members |
| teams | name, slug (unique), isPersonal, polarCustomerId, subscriptionTier, subscriptionStatus | messages, members, invites |
| members | searchable | team, user, role, messages |
| roles | name (Owner/Admin/Member), isDefault | permissions, members |
| permissions | name (14 permissions) | roles |
| invites | email, inviterEmail | team, role |

### Feature Entities

| Entity | Purpose | Edges |
|--------|---------|-------|
| notes | Example CRUD app | team, member |
| aiConversations | AI chat sessions | team, member |
| aiMessages | Individual AI messages | conversation |
| aiUsage | Token tracking per team/period | team |
| notifications | In-app notifications | user |
| notificationPreferences | Per-user notification settings | user |
| onboardingProgress | Wizard step tracking | user |
| featureFlags | Global flag definitions | - |
| teamFeatureFlags | Per-team flag overrides | team, featureFlag |
| analyticsEvents | First-party event tracking | team, user |
| auditLog | Admin action audit trail | user |

Soft deletion on users, teams, members, notes, aiConversations. Teams have 7-day deletion grace period.

## Commands

```bash
npm run dev              # Start frontend + Convex backend in parallel
npm run dev:frontend     # Next.js dev server only
npm run dev:backend      # Convex dev only (typecheck disabled)
npm run build            # Next.js production build
npm run lint             # tsc + next lint
```

## Conventions

- **Path aliases:** `@/*` maps to project root (e.g., `@/components/ui/button`)
- **Auth pattern:** Use `viewerWithPermission()` / `viewerHasPermissionX()` from `convex/permissions.ts`
- **Entitlement pattern:** Use `checkEntitlement(ctx, teamId, key)` from `convex/entitlements.ts`
- **Convex functions:** Use custom `query`/`mutation`/`internalQuery`/`internalMutation` from `convex/functions.ts` (not raw Convex imports) — these inject authenticated context
- **Admin functions:** Use `adminQuery`/`adminMutation` wrappers that enforce `isSuperAdmin`
- **Components:** shadcn/ui lives in `components/ui/` — add via `npx shadcn-ui@latest add <component>`, don't hand-edit
- **Routing:** Authenticated pages under `app/t/[teamSlug]/`; admin under `app/admin/`; auth under `app/auth/`; root `/` is public landing
- **Team context:** Use `useCurrentTeam()` hook from `app/t/[teamSlug]/hooks.ts`
- **Feature flags:** Use `useFeatureFlag(key)` hook — returns boolean
- **Analytics:** Use `useTrack()` hook — returns fire-and-forget tracking function
- **Billing:** Team-level (not per-user). Tiers/limits configured in `lib/planConfig.ts`
- **ESLint:** Ignores `convex/_generated` and `components/ui`

## Security Architecture

Three-layer enforcement:
1. **Schema layer:** Validators on all args, unique constraints, soft deletion
2. **Runtime layer:** `viewerX()` auth, `viewerHasPermissionX()` permissions, `checkEntitlement()` tier-gating, `checkRateLimit()` rate limiting
3. **Infrastructure layer:** No client-side auth decisions, env vars for secrets, HMAC webhook verification

Key security primitives:
- `requireSuperAdmin(ctx)` — throws if not super admin
- `checkRateLimit(ctx, key, limit)` — token bucket rate limiting
- `auditLog(ctx, action, details)` — admin action audit trail

## Environment Variables

```
NEXT_PUBLIC_CONVEX_URL            # Convex deployment URL
CONVEX_AUTH_PRIVATE_KEY           # Convex Auth signing key
POLAR_ACCESS_TOKEN                # Polar API access token
POLAR_WEBHOOK_SECRET              # Polar webhook HMAC secret
OPENAI_API_KEY                    # OpenAI API key (optional)
ANTHROPIC_API_KEY                 # Anthropic API key (optional)
RESEND_API_KEY                    # Resend email API key
HOSTED_URL                        # Public URL for email links
```

## V2 Roadmap (F001)

See `docs/prds/F001-saas-boilerplate-v2.md` for full PRD.

| Module | Priority | Status |
|--------|----------|--------|
| Convex Auth Migration (F001-001) | P0 | Pending |
| Design System Expansion (F001-002) | P0 | Pending |
| Polar Billing Integration (F001-003) | P1 | Pending |
| Enhanced RBAC (F001-004) | P1 | Pending |
| AI/LLM Integration (F001-005) | P2 | Pending |
| Notification System (F001-006) | P2 | Pending |
| Onboarding System (F001-007) | P2 | Pending |
| Feature Flags (F001-008) | P3 | Pending |
| Analytics & Event Tracking (F001-009) | P3 | Pending |
| Super Admin Panel (F001-010) | P3 | Pending |
| Example App - Notes CRUD (F001-011) | P2 | Pending |

## Vibe System

This project uses the [Vibe System](https://github.com/vibe-system/vibe-system) for structured Claude Code workflows. Run `/help` to see available commands. Use `/build F001-XXX` to build individual modules.
