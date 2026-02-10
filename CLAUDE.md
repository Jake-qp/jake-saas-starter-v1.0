# CLAUDE.md — SaaS Starter Kit V2

## Project Overview

Multi-tenant SaaS boilerplate: Next.js 14 (App Router) + Convex (backend + auth) + shadcn/ui + Resend (email).
Migrating from V1 (Clerk) to V2 (Convex Auth, Polar billing, AI, admin). See `docs/prds/F001-saas-boilerplate-v2.md` for PRD.

## Tech Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript
- **Backend:** Convex (realtime database + serverless functions)
- **Auth:** Convex Auth (`@convex-dev/auth`) — email/password + magic link via Resend OTP
- **Billing:** Polar via `@convex-dev/polar` (team-level + credit-based AI)
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`)
- **UI:** shadcn/ui (New York style), Tailwind CSS, Radix, next-themes
- **Email:** Resend + React Email
- **Validation:** Zod | **Forms:** react-hook-form
- **Testing:** Vitest + convex-test + Playwright + axe-playwright

## Commands

```bash
npm run dev              # Start frontend + Convex backend in parallel
npm run dev:frontend     # Next.js dev server only
npm run dev:backend      # Convex dev only
npm run build            # Next.js production build
npm run lint             # tsc + next lint
npm run type-check       # TypeScript type check only
npm run test             # Unit + integration tests (Vitest)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Tests with coverage report
npm run test:e2e         # E2E tests (Playwright)
npm run test:all         # All tests (Vitest + Playwright)
```

## Conventions

- **Path aliases:** `@/*` maps to project root (e.g., `@/components/ui/button`)
- **Auth pattern:** Use `viewerWithPermission()` / `viewerHasPermissionX()` from `convex/permissions.ts`
- **Entitlement pattern:** Use `checkEntitlement(ctx, teamId, key)` from `convex/entitlements.ts`
- **Convex functions:** Use custom `query`/`mutation`/`internalQuery`/`internalMutation` from `convex/functions.ts` — these inject authenticated context
- **Admin functions:** Use `adminQuery`/`adminMutation` wrappers that enforce `isSuperAdmin`
- **Components:** shadcn/ui lives in `components/ui/` — add via `npx shadcn-ui@latest add <component>`, don't hand-edit
- **Routing:** Marketing: `app/(marketing)/` | Auth: `app/auth/` | App: `app/t/[teamSlug]/` | Admin: `app/admin/` | Blog: `app/blog/`
- **Team context:** Use `useCurrentTeam()` hook from `app/t/[teamSlug]/hooks.ts`
- **Feature flags:** Use `useFeatureFlag(key)` hook — returns boolean
- **Analytics:** Use `useTrack()` hook — returns fire-and-forget tracking function
- **Billing:** Team-level (not per-user). Tiers/limits/credits configured in `lib/planConfig.ts`
- **AI streaming:** Default via Next.js API route; alternative via Convex HTTP action (see [ADR-004](docs/adrs/004-ai-dual-streaming.md))
- **Blog/Legal:** MDX files in `content/`; processed at build time
- **Monitoring:** Sentry (optional, env-var gated); Vercel Analytics + Speed Insights always active
- **Deployment:** Vercel (auto-deploy from GitHub). Build: `npx convex deploy --cmd 'npm run build'`
- **ESLint:** Ignores `convex/_generated` and `components/ui`

### Mutation Pattern (Required)

Every new Convex mutation must follow this pattern:

```
1. Authenticate: ctx.viewerX() or getAuthUserId()
2. Authorize: viewerHasPermissionX(ctx, teamId, "Permission Name")
3. Entitle: checkEntitlement(ctx, teamId, "limitKey")
4. Rate limit: checkRateLimit(ctx, key, limit) — for expensive operations
5. Execute: business logic
6. Audit: auditLog() — for admin actions
```

### Testing (Required)

- Every Convex mutation MUST have permission + entitlement tests
- Every new function in `lib/` MUST have unit tests
- E2E tests required for any new user-facing flow
- Test files live next to source: `convex/__tests__/`, `lib/__tests__/`, `e2e/`
- Use `convex-test` for mocking auth context and database state

## Architecture & Data Model

See [ARCHITECTURE.md](ARCHITECTURE.md) for system design, data model, key flows, security architecture, and module dependencies.

## Architecture Decisions

See [docs/adrs/](docs/adrs/) for rationale on Convex Auth, Polar billing, convex-ents, AI streaming, MDX content, Vercel deployment, and credit-based billing.

## Environment Variables

**Convex Dashboard:** `SITE_URL`, `CONVEX_AUTH_PRIVATE_KEY`, `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `HOSTED_URL`

**Vercel Dashboard:** `CONVEX_DEPLOY_KEY`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_CONVEX_URL` (auto-set)

## V2 Roadmap (F001)

See `docs/prds/F001-saas-boilerplate-v2.md` for full PRD with specs.

| Module | Priority | Status |
|--------|----------|--------|
| Convex Auth + Magic Link (F001-001) | P0 | Pending |
| Design System Expansion (F001-002) | P0 | Pending |
| Testing & Quality Infrastructure (F001-016) | P0 | Pending |
| Polar Billing + Credits (F001-003) | P1 | Pending |
| Enhanced RBAC (F001-004) | P1 | Pending |
| Marketing Site & Legal Pages (F001-012) | P1 | Pending |
| Production Infrastructure (F001-014) | P1 | Pending |
| AI/LLM Integration (F001-005) | P2 | Pending |
| Notification System (F001-006) | P2 | Pending |
| Onboarding System (F001-007) | P2 | Pending |
| Example App - Notes CRUD (F001-011) | P2 | Pending |
| Blog & Changelog (F001-013) | P2 | Pending |
| Feature Flags (F001-008) | P3 | Pending |
| Analytics & Event Tracking (F001-009) | P3 | Pending |
| Super Admin Panel (F001-010) | P3 | Pending |
| Waitlist / Pre-Launch Mode (F001-015) | P3 | Pending |

## Vibe System

This project uses the [Vibe System](https://github.com/vibe-system/vibe-system) for structured Claude Code workflows. Run `/help` to see available commands. Use `/build F001-XXX` to build individual modules.
