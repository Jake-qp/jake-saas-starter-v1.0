# Contributing

Guide for developers working with the SaaS Starter Kit V2.

## Prerequisites

- Node.js 20+
- npm
- A [Convex](https://convex.dev) account (free tier available)
- A [Resend](https://resend.com) account (for email)

## Dev Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd jake-saas-starter-v1.0
   npm install
   ```

2. Set up Convex:
   ```bash
   npx convex dev --once  # Creates a new Convex project
   ```

3. Configure environment variables — see `ARCHITECTURE.md` for the full list.

4. Start development:
   ```bash
   npm run dev  # Starts Next.js + Convex in parallel
   ```

## Testing

```bash
npm run test              # Unit + integration tests (Vitest)
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
npm run test:e2e          # End-to-end tests (Playwright)
npm run test:e2e:ui       # Playwright UI mode
npm run test:all          # Run everything
```

### Writing Tests

- **Convex functions:** Place tests in `convex/__tests__/`. Use `convex-test` for mocking auth context and database state.
- **Utilities:** Place tests in `lib/__tests__/`.
- **E2E tests:** Place tests in `e2e/`. Use Playwright with the auth fixture from `e2e/fixtures/auth.ts`.
- **Convention:** Every Convex mutation must have permission and entitlement tests. Every utility function must have unit tests.

### Test Structure

```
tests/setup.ts                    # Vitest global setup
convex/__tests__/                 # Convex function tests
components/__tests__/             # Component tests (React Testing Library)
lib/__tests__/                    # Utility tests
e2e/                              # Playwright E2E tests
  fixtures/                       # Reusable test fixtures
```

## Adding a New Module

1. **Write a PRD** — Add to `docs/prds/` or extend `F001-saas-boilerplate-v2.md`
2. **Create an ADR** — If the module involves a significant decision, add to `docs/adrs/`
3. **Implement backend** — Convex functions in `convex/<module>/`
4. **Implement frontend** — Pages in `app/t/[teamSlug]/<module>/`
5. **Write tests** — Unit tests alongside source, E2E in `e2e/`
6. **Update CLAUDE.md** — Add conventions for the new module

### Convex Function Pattern

Every new mutation should follow this pattern:

```typescript
export const create = mutation({
  args: { teamId: v.id("teams"), /* ... */ },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const viewer = ctx.viewerX();
    // 2. Authorize
    await viewerHasPermissionX(ctx, args.teamId, "Permission Name");
    // 3. Check entitlements
    await checkEntitlement(ctx, args.teamId, "limitKey");
    // 4. Rate limit (for expensive operations)
    await checkRateLimit(ctx, "operation:key", { rate: 10, period: 60000 });
    // 5. Execute business logic
    const id = await ctx.table("entities").insert({ ... });
    // 6. Audit (for admin actions)
    await auditLog(ctx, "entity.created", { entityId: id });
    return id;
  },
});
```

## Code Style

- **TypeScript strict mode** — no `any` types in new code
- **Path aliases** — use `@/` for imports (e.g., `@/components/ui/button`)
- **shadcn/ui** — add components via `npx shadcn@latest add <component>`, don't hand-edit `components/ui/`
- **Convex functions** — use custom wrappers from `convex/functions.ts`, not raw Convex imports
- **Formatting** — Prettier with default config

### Design System (ESLint-Enforced)

- **Semantic color tokens only** — raw Tailwind colors (`bg-red-500`, `text-blue-300`) are ESLint errors. Use `bg-primary`, `bg-destructive`, `bg-warning`, `bg-success`, `bg-info`, etc.
- **No inline styles** — `style={{}}` props are ESLint errors. Use Tailwind classes or component variants.
- **Icons** — use `@radix-ui/react-icons` only. `lucide-react` imports are banned in app code (ESLint enforced).
- **Class merging** — use `cn()` from `@/lib/utils`, not string concatenation.
- **App components** — use `PageHeader`, `DataTable`, `EmptyState`, `StatusBadge`, `PricingCard`, `UsageMeter`, `StepWizard`, `ThemeToggle` from `@/components`. See `docs/component-manifest.md` for the full reference.
- **Dark mode** — uses `next-themes` with class strategy. All UI should work in both light and dark modes.

## PR Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all checks pass:
   ```bash
   npm run type-check    # TypeScript
   npm run lint          # ESLint
   npm run test          # Unit tests
   npm run test:e2e      # E2E tests (if UI changed)
   ```
4. Commit with a descriptive message
5. Open a PR against `main`
6. CI runs automatically (type-check, lint, tests)

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for system design, data model, and key flows.

## Vibe System

This project uses the [Vibe System](https://github.com/vibe-system/vibe-system) for structured Claude Code workflows. See `.claude/SYSTEM.md` for full documentation. Key commands:

- `/build F001-XXX` — Build a specific module
- `/test` — Run QA testing
- `/harden` — Security and quality hardening
- `/status` — Check project status
