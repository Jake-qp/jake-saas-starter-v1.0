# Build Progress

## Current Feature
**ID:** F001-001
**Phase:** 1 → 2
**Status:** Spec approved (auto-decided from PRD), starting design

**Spec:** `docs/specs/F001-001-convex-auth.spec`
- User: SaaS developer
- Screens: 4 (sign-in, sign-up, forgot-password, profile/sessions)
- Flows: 6 (sign-up, sign-in password, sign-in magic link, forgot password, session mgmt, timezone)
- Acceptance criteria: 12

## PRD Anchor (Source of Truth)
**Feature:** F001-001
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-001 -->/,/<!-- END_FEATURE: F001-001 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

<!-- ⚠️ DO NOT INVENT REQUIREMENTS. Re-extract from PRD when needed. -->

---

## Last Completed
**ID:** F001-016
**Date:** 2026-02-11

Testing & Quality Infrastructure — Vitest, Playwright, CI/CD, pre-commit hooks, seed tests, ESLint tightening.

**Spec:** `docs/specs/F001-016-testing-quality-infrastructure.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 57 passing (20 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 2 complete (F001-002, F001-016)
