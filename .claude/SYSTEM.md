# Vibe System V10

> A structured workflow that turns natural language into production-ready applications.

**Key Features:** Hook-enforced gates | PRD compliance | Auto-verify Phases 4-5 | Mock data lifecycle | Markdown-based state

> For detailed reference (examples, templates, bash scripts): `cat .claude/REFERENCE.md`

---

## First Message Protocol

On FIRST response in any session, check for in-progress work:

```bash
# V10: Check IMPLEMENTATION_PLAN.md
grep "| in_progress |" IMPLEMENTATION_PLAN.md 2>/dev/null

# V9 Legacy: Check feature_list.json
cat feature_list.json 2>/dev/null | grep -A2 '"status": "in_progress"'
```

If found, offer to resume or start fresh. Wait for user response.

---

## Quick Reference

| Need | Command |
|------|---------|
| Complex feature | `/prd "feature"` |
| Single feature | `/build "feature"` |
| Build all PRD | `/build-auto "PRD_ID"` |
| Tiny change | `/quick "change"` |
| Fix bug | `/fix "bug"` |
| QA testing | `/test "feature"` |
| Improve code | `/refactor "goal"` |
| Add tests | `/harden` |
| Security audit | `/security-check` |
| Batch tasks | `/batch` |
| Launch check | `/launch` |
| See status | `/status` |

---

## The Workflow

```
/build "feature"
│
├─ PHASE 1: SPEC              [DECISION GATE - human approval]
│  └─ Load spec skill → Present outline → WAIT for approval → Commit
│
├─ PHASE 2: VISUAL DESIGN     [DECISION GATE - human approval]
│  └─ Load ux/design skills → Create UI with mock data → WAIT → Commit
│
├─ PHASE 3: DATA MODEL        [DECISION GATE - human approval]
│  └─ Load database skill → Present model → WAIT for approval → Commit
│
├─ PHASE 4: BUILD             [VERIFICATION GATE - auto-verify]
│  └─ Load TDD skill → RED/GREEN → Remove mock data → Gate checks → Commit
│
└─ PHASE 5: VERIFY            [VERIFICATION GATE - auto-verify]
   └─ Spec compliance → CHANGELOG → Gate checks → Commit
```

---

## Gate Types

**Decision Gates (Phases 1-3):** Require human judgment. Claude STOPS and WAITS.

**Verification Gates (Phases 4-5):** Machine-checkable. Claude auto-verifies, fixes, retries (max 3). Enforced by `phase-gate.sh` hook returning exit code 2.

---

## Hook Enforcement

The `phase-gate.sh` Stop hook enforces gates by reading `progress.md`:

```markdown
**Phase:** 4
**Gate Status:** pending
**Gate Attempt:** 1
```

| Phase | Checks |
|-------|--------|
| 2 | Mock data exists |
| 4 | Mock data removed, tests pass, build succeeds |
| 5 | CHANGELOG updated, tracking updated (V10: IMPLEMENTATION_PLAN.md, V9: feature_list.json) |

Exit 2 = Claude must continue and fix. After 3 attempts = escalate to human.

---

## PRD Compliance (V9.3)

When building from PRD, Claude extracts FULL child feature section using:
```bash
sed -n "/<!-- START_FEATURE: $FEATURE_ID -->/,/<!-- END_FEATURE: $FEATURE_ID -->/p" "$PRD_FILE"
```

Stores as PRD Anchor in progress.md. At EVERY phase, verify against anchor.

**DO NOT invent features not in PRD. If ambiguous, STOP and ask.**

---

## Key Rules

1. **Design System First** - Use shadcn/ui (`npx shadcn@latest init`) then customize CSS variables
2. **Re-confirm After Changes** - If user modifies outline, show updated version and wait
3. **Phase 3 Approval Required** - Data model changes are expensive later
4. **Test Count Must Increase** - New CRUD = new tests (record before/after)
5. **Mock Data Lifecycle** - Phase 2 MUST have it, Phase 4 MUST remove it
6. **PRD Compliance** - Only build what's in PRD, never invent
7. **Per-Phase Commits** - spec: / design: / arch: / feat: / verify:
8. **Backend TDD** - Skipping Phases 2-3 does NOT skip Phase 4 TDD
9. **CLAUDE.md is User-Owned** - System never modifies it

### Reasoning Discipline (V10)

10. **State Assumptions First** - Before writing code, explicitly state assumptions about inputs, state, and environment
11. **Verify Before Claiming** - Don't claim code is correct without running tests or builds
12. **Handle Edge Cases** - Don't implement only the happy path; consider failures, nulls, boundaries
13. **Articulate Constraints** - State when the solution works and when it doesn't
14. **Search Before Creating** - Don't assume something isn't implemented; search the codebase first

---

## Skills

See `.claude/skills/SKILLS-INDEX.md` for complete reference.

| Phase | Skills to Load |
|-------|----------------|
| /prd | prd |
| Phase 1 | spec |
| Phase 2 | ux, ui, accessibility |
| Phase 3 | database, backend, architecture |
| Phase 4 | tdd, testing, error-handling |
| Phase 5 | verification, changelog, security-check |
| /test | test |

**Load via:** `cat .claude/skills/[skill]/SKILL.md`

**Commands:** See `.claude/commands/` for workflow command documentation.

---

## Feature Tracking

**V10:** `IMPLEMENTATION_PLAN.md` tracks all features and tasks. `progress.md` tracks current session.

**V9 Legacy:** `feature_list.json` tracks features. Run `/migrate` to upgrade.

Status flow: `pending` → `in_progress` → `complete`

PRD child features use pattern: `F027-001`, `F027-002` (parent: `F027`)

### The Pin (V10)

`specs/readme.md` is the project knowledge index. Load it first to improve search and prevent invention.

`cat specs/readme.md` → Find keywords, spec locations, source paths

---

## Agents

| Agent | When |
|-------|------|
| initializer | First /build, no ARCHITECTURE.md |
| explorer | Large/existing codebase |
| reviewer | Before /launch |
| researcher | External dependencies |
| fixer | 3+ failures on same issue |

---

*For detailed examples, bash scripts, and templates: `cat .claude/REFERENCE.md`*
