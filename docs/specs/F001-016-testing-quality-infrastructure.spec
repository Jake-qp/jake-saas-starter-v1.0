# Feature: Testing & Quality Infrastructure (F001-016)

## User Context
- **Primary User:** Developer building on the SaaS Starter Kit V2
- **Context:** Local development environment + CI pipeline
- **Top Goals:**
  1. Run unit/integration tests quickly during development
  2. Catch regressions before merging via CI/CD
  3. Maintain code quality with consistent linting and formatting
- **Mental Model:** "npm run test" runs tests, "git push" triggers CI, pre-commit hooks catch issues early
- **Key Questions:** Are tests passing? Is coverage adequate? Does CI pass?

## Feature Outline (Approved)

### Components
1. **Vitest Configuration** - Unit/integration testing with convex-test, jsdom, V8 coverage
2. **Playwright Configuration** - E2E testing with axe-playwright for accessibility
3. **GitHub Actions CI** - Automated pipeline: type-check, lint, unit tests, E2E tests
4. **Husky + Lint-Staged** - Pre-commit hooks for eslint, prettier, vitest related
5. **ESLint Tightening** - `no-explicit-any: warn`, `no-unused-vars: error`, design system enforcement
6. **Seed Test Files** - Permissions, plan config, auth E2E, accessibility templates
7. **Documentation** - ARCHITECTURE.md, CONTRIBUTING.md, 8 ADRs

### Out of Scope
- Full test implementations for future features (F001-001, F001-003, F001-004)
- Code coverage thresholds (added later when more features exist)
- Performance testing infrastructure
- Visual regression testing

## User Story
As a developer working on the SaaS Starter Kit V2
I want a comprehensive testing and quality infrastructure
So that I can write tests, maintain code quality, and catch regressions automatically

## Acceptance Criteria
- [x] AC1: `npm run test` runs Vitest unit/integration tests and passes
- [x] AC2: `npm run test:e2e` runs Playwright E2E tests (requires dev server)
- [x] AC3: `npm run test:coverage` generates V8 coverage report
- [x] AC4: `npm run type-check` runs TypeScript strict check
- [x] AC5: Git commit triggers pre-commit hooks (lint-staged with ESLint, Prettier, related tests)
- [x] AC6: `.github/workflows/ci.yml` runs on push/PR: type-check, lint, unit tests, E2E tests
- [x] AC7: Seed test files exist for permissions, plan config, auth E2E, and accessibility
- [x] AC8: ESLint rules tightened: `no-explicit-any: warn`, `no-unused-vars: error`
- [x] AC9: ARCHITECTURE.md contains system design, data model, and key flows
- [x] AC10: `docs/adrs/` has 8 Architecture Decision Records
- [x] AC11: CONTRIBUTING.md documents dev setup, testing, PR process

## Edge Cases
- Vitest and Playwright must not conflict (separate configs, excluded patterns)
- E2E tests excluded from tsconfig.json to avoid type conflicts with main project
- Pre-commit hooks must not block commits on pre-existing lint errors in V1 code
- CI must handle both unit tests and E2E tests (sequential dependency)

## Success Definition
We'll know this works when: `npm run test` passes, `npm run test:e2e` runs without config errors, pre-commit hooks fire on commit, and the CI pipeline structure is verified.
