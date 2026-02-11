# Feature Specs Index

## Feature Specs

| ID | Name | Status | Spec File |
|----|------|--------|-----------|
| F001-002 | Design System Expansion | ✅ | (built before spec system) |
| F001-016 | Testing & Quality Infrastructure | ✅ | `docs/specs/F001-016-testing-quality-infrastructure.spec` |

## Source Code Index

| Module | Location | Purpose |
|--------|----------|---------|
| Vitest config | `vitest.config.ts` | Unit/integration test runner configuration |
| Playwright config | `playwright.config.ts` | E2E test runner configuration |
| Test setup | `tests/setup.ts` | Vitest global setup (jest-dom matchers) |
| CI pipeline | `.github/workflows/ci.yml` | GitHub Actions: type-check, lint, test, e2e |
| Pre-commit hooks | `.husky/pre-commit` | Husky + lint-staged hook |
| ESLint config | `.eslintrc.cjs` | Linting rules + design system enforcement |
| Component tests | `components/__tests__/` | React Testing Library component tests |
| Convex tests | `convex/__tests__/` | Convex function tests (convex-test) |
| Lib tests | `lib/__tests__/` | Utility function tests |
| E2E tests | `e2e/` | Playwright E2E + accessibility tests |
| E2E fixtures | `e2e/fixtures/` | Reusable Playwright test fixtures |

## Concept Index

| Concept | Definition | Location |
|---------|------------|----------|
| Seed test | Test file with `.todo()` or `.skip()` placeholders for future feature implementation | `convex/__tests__/`, `lib/__tests__/`, `e2e/` |
| Design system enforcement | ESLint rules banning raw Tailwind colors, inline styles, lucide-react, direct Radix imports | `.eslintrc.cjs`, `eslint-rules/` |
| Pre-commit quality gate | Lint-staged runs eslint, prettier, and vitest related on staged files before each commit | `package.json` lint-staged config |
