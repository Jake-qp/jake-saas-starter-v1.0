# CLAUDE.md — SaaS Starter Kit

## Project Overview

Multi-tenant SaaS starter built on Next.js 14 (App Router), Convex (realtime backend), Clerk (auth), shadcn/ui (components), and Resend (email). Supports teams, role-based access control, member invitations, and soft deletion.

## Tech Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript
- **Backend:** Convex (realtime database + serverless functions)
- **Auth:** Clerk (`@clerk/nextjs`) with JWT-based Convex integration
- **UI:** shadcn/ui (New York style), Tailwind CSS, Radix primitives
- **Email:** Resend
- **Validation:** Zod
- **Forms:** react-hook-form

## Directory Structure

```
app/                    Next.js App Router pages & layouts
  ConvexClientProvider  Clerk + Convex provider wrapper
  t/                    Authenticated routes (team context)
    [teamSlug]/         Per-team pages (dashboard, settings, members)
components/
  ui/                   shadcn/ui components (do not edit manually)
convex/                 Convex backend
  schema.ts             Data model (convex-ents)
  functions.ts          Custom query/mutation wrappers with auth
  permissions.ts        RBAC permission checks
  types.ts              Custom context types
  users/teams/          Team, member, role, message functions
lib/                    Shared utilities
middleware.ts           Clerk auth middleware
```

## Data Model (convex-ents)

| Entity       | Key Fields                              | Edges                      |
|-------------|----------------------------------------|---------------------------|
| users       | email, tokenIdentifier, fullName       | members                   |
| teams       | name, slug (unique), isPersonal        | messages, members, invites |
| members     | searchable                             | team, user, role, messages |
| roles       | name ("Admin" / "Member"), isDefault   | permissions, members       |
| permissions | name ("Manage Team", "Delete Team", etc.) | roles                   |
| invites     | email, inviterEmail                    | team, role                |
| messages    | text                                   | team, member              |

Soft deletion is enabled on users, teams, and members. Teams have a 7-day deletion grace period.

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
- **Auth pattern:** Use `viewerWithPermission()` / `viewerHasPermissionX()` from `convex/permissions.ts` in Convex functions
- **Convex functions:** Use custom `query`/`mutation`/`internalQuery`/`internalMutation` from `convex/functions.ts` (not raw Convex imports) — these inject authenticated context
- **Components:** shadcn/ui lives in `components/ui/` — add new ones via `npx shadcn-ui@latest add <component>`, don't hand-edit
- **Routing:** All authenticated pages live under `app/t/[teamSlug]/`; the root `/` is a public landing page
- **Team context:** Use `useCurrentTeam()` hook from `app/t/hooks.ts` inside team routes
- **ESLint:** Ignores `convex/_generated` and `components/ui`

## Environment Variables

```
NEXT_PUBLIC_CONVEX_URL           # Convex deployment URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY # Clerk public key
CLERK_SECRET_KEY                 # Clerk secret key
CLERK_JWT_ISSUER_DOMAIN          # Clerk JWT issuer for Convex auth
```

## Vibe System

This project uses the [Vibe System](https://github.com/vibe-system/vibe-system) for structured Claude Code workflows. Run `/help` to see available commands.
