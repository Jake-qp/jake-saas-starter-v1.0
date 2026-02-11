# Changelog

All notable changes to the SaaS Starter Kit V2 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Testing & Quality Infrastructure (F001-016): Vitest + convex-test for unit/integration tests, Playwright + axe-playwright for E2E and accessibility tests, GitHub Actions CI pipeline (type-check, lint, unit tests, E2E), Husky + lint-staged pre-commit hooks, seed test files for permissions/planConfig/auth/accessibility, tightened ESLint rules
- Design System Expansion (F001-002): 8 app-level components (PageHeader, DataTable, EmptyState, StatusBadge, PricingCard, UsageMeter, StepWizard, ThemeToggle), semantic color tokens enforced via ESLint, dark mode support
