# App Pages — AI Instructions

## Rules

1. Use `<PageHeader>` from `@/components/PageHeader` for ALL page headers — never inline `<h1>`.
2. Use `<EmptyState>` from `@/components/EmptyState` for ALL zero/empty states.
3. Use `<DataTable>` from `@/components/DataTable` for ALL tabular data.
4. Use `useCurrentTeam()` from `./hooks.ts` for team context.
5. Use semantic color tokens — no raw Tailwind colors (ESLint enforced).
6. Use `<StatusBadge>` for subscription/status indicators.
7. Use `<UsageMeter>` for usage/quota displays.
