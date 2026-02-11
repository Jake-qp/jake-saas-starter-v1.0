# Components — AI Instructions

## Rules

1. Use semantic color tokens only — raw colors (`bg-red-500`, `text-slate-*`) are **ESLint errors**.
2. Use `cn()` from `@/lib/utils` for class merging — never string concatenation.
3. Do NOT edit files in `ui/` — those are shadcn primitives. Add new ones via `npx shadcn@latest add`.
4. Check `@/components/index.ts` and `docs/component-manifest.md` before building anything new.
5. Icons: `@radix-ui/react-icons` only. `lucide-react` is banned (ESLint enforced).
6. No inline `style={}` props (ESLint enforced).
7. All new components need JSDoc with `@example`.
