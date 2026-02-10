---
description: Fix a bug with proper debugging and test verification. Usage: /fix "bug description"
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /fix - Fix a Bug

**Bug:** $ARGUMENTS

---

## Before Attempting Fix (V8.7)

### Step 0: Load Project Knowledge Index (The Pin)

**Before debugging, understand the project context:**

```bash
cat docs/specs/readme.md
```

After reading, announce: "✓ The Pin loaded"

**The Pin helps you:**
- Find which module handles the broken functionality
- Understand data flows and dependencies
- Avoid "fixing" by reinventing existing patterns

---

### Step 1: Identify Error Type

Is this error related to an **external library or API**?

**Signs of external API issues:**
- Import errors (`Cannot find module`, `is not exported`)
- API response mismatches (`Expected X, got Y`)
- Method errors (`X is not a function`, `Invalid parameter`)
- HTTP errors from external services (4xx, 5xx from Stripe, Auth0, etc.)
- Type errors on library methods

### Step 2: If External → Check Docs First

**🔍 Use Ref MCP before guessing at fixes:**

```
ref_search_documentation("[library] [method] [error context]")
```

**Examples:**
- `ref_search_documentation("Stripe checkout session line_items parameter")`
- `ref_search_documentation("Next.js 15 middleware request cookies")`
- `ref_search_documentation("Prisma findMany include relation filter")`
- `ref_search_documentation("React Query useQuery options staleTime")`

**Why:** The "bug" might be Claude using an outdated API from training data.
Checking docs first = fix in one attempt instead of 5 guesses.

### Step 3: If Internal Logic → Proceed with normal debugging

If the error is in YOUR code logic (not external APIs), proceed with standard debugging below.

---

## Phase 1: Reproduce

1. Get exact reproduction steps
2. Create a failing test that demonstrates the bug (if possible)
3. Verify test fails for the right reason

```
Reproduction:
1. [step]
2. [step]
Expected: [what should happen]
Actual: [what happens]
```

---

## Phase 2: Investigate

**Load skill:**
```bash
cat .claude/skills/debugging/SKILL.md
```

After reading, announce: "✓ Debugging skill loaded"

Find the root cause:
- Don't guess - trace the actual code path
- Use logging/debugger to follow data
- Check recent commits for regressions

**Document:**
```
Root Cause: [What is actually broken and why]
```

---

## Phase 3: Baseline (REQUIRED if tests exist)

**Before making ANY changes, establish a baseline:**

```bash
npm test 2>&1
```

**Record:**
- How many tests currently pass (e.g., "42 tests passing")
- Any already-failing tests (list them)
- Note: "Baseline: X tests passing before fix"

If no tests exist, note: "No existing tests - skipping baseline."

---

## Phase 4: Three-Failure Rule

If stuck after 3 attempts:
1. STOP trying the same approach
2. Spawn: `.claude/agents/explorer.md` or `.claude/agents/fixer.md`
3. Reassess: Is root cause analysis correct?

---

## Phase 5: Fix

- Fix root cause, not symptoms
- Minimal change
- Can modify tests in /fix mode (unlike /build)

---

## Phase 6: Verify (REQUIRED)

**After implementing the fix:**

```bash
npm test 2>&1
```

### Verification Checklist

**1. Regression check:**
- Baseline tests: [X] passing
- After fix tests: [Y] passing
- All baseline tests still pass? ✅ / ❌

**⚠️ If any previously-passing test now fails → STOP.**
- The fix broke something else
- Address the regression before continuing
- Do NOT commit a fix that creates a new bug

**2. Bug fix verification:**
- Does the bug reproduction test now pass? (if created)
- Does the original bug still occur? (manual check if no test)

**3. New test consideration:**
- Did the fix add new functionality? → Should have a test
- Was this bug catchable by a test? → Add one to prevent regression

---

## Phase 7: Update Changelog

**Load skill:**
```bash
cat .claude/skills/changelog/SKILL.md
```

Add entry to CHANGELOG.md [Unreleased] section:
- Category: **Fixed**
- Entry: Description of what was broken and how it manifested

Example: "Fixed: Users were logged out unexpectedly when switching tabs"

---

## Phase 8: Update Progress (V8.5)

If `progress.md` exists, add a note:

```markdown
### Bug Fix - [timestamp]
- Bug: $ARGUMENTS
- Root cause: [brief description]
- Files changed: [list]
- Tests: [X] before → [X] after
- Regression test added: [Yes/No]
```

---

## Phase 9: Report

**Fix Summary:**

```
## Bug Fix Complete

### Root Cause
[What was actually broken]

### Changes Made
- [File 1]: [What changed]
- [File 2]: [What changed]

### Test Results
- Baseline: [X] tests passing
- After fix: [Y] tests passing
- Regressions: None ✅ / [List any] ❌

### Verification
- Bug reproduction: [Passes/Confirmed fixed]
- New tests added: [Yes/No] - [Description if yes]

### Changelog
- Added to CHANGELOG.md: Yes
```

---

## Phase 10: Commit

**Only if tests pass and no regressions:**

```bash
git add -A
git commit -m "fix: $description

Root cause: [what was wrong]
Fix: [what we changed]
Tests: [X] passing (no regressions)"
```

---

## Fix Workflow Summary

```
┌─────────────────────────────────────────────────┐
│ Phase 1: REPRODUCE  │ Document exact steps       │
├─────────────────────┼───────────────────────────┤
│ Phase 2: INVESTIGATE│ Find root cause            │
├─────────────────────┼───────────────────────────┤
│ Phase 3: BASELINE   │ npm test (record count)   │
├─────────────────────┼───────────────────────────┤
│ Phase 4: THREE-FAIL │ Escalate if stuck          │
├─────────────────────┼───────────────────────────┤
│ Phase 5: FIX        │ Minimal change             │
├─────────────────────┼───────────────────────────┤
│ Phase 6: VERIFY     │ npm test (compare)        │
├─────────────────────┼───────────────────────────┤
│ Phase 7: CHANGELOG  │ Update CHANGELOG.md       │
├─────────────────────┼───────────────────────────┤
│ Phase 8: PROGRESS   │ Update progress.md        │ ← V8.5
├─────────────────────┼───────────────────────────┤
│ Phase 9: REPORT     │ Document what changed      │
├─────────────────────┼───────────────────────────┤
│ Phase 10: COMMIT    │ Only if all pass           │
└─────────────────────┴───────────────────────────┘
```

---

## Done Criteria

- [ ] Root cause identified and documented
- [ ] Baseline tests recorded before fix
- [ ] Fix implemented (minimal change)
- [ ] All baseline tests still pass (no regressions)
- [ ] Bug is verified fixed
- [ ] Test added for this bug (if appropriate)
- [ ] CHANGELOG.md updated
- [ ] progress.md updated (V8.5)
- [ ] Committed with proper message
