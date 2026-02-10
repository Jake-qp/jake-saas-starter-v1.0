---
description: Make a small change quickly with regression protection. Usage: /quick "what to change"
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /quick - Quick Change Mode

**Change:** $ARGUMENTS

---

## Is This Actually Quick?

### ✅ Quick (use this command)
- Less than 50 lines changed
- 1-2 files maximum
- No new features, just modifications
- Existing patterns, no design needed
- Not security-sensitive

### ❌ Not Quick (use /build instead)
- New feature or capability
- Multiple new files
- Requires design decisions
- Should have tests
- Security-sensitive

**If not quick:** Suggest `/build "$ARGUMENTS"` instead.

---

## Quick Workflow (V8.5 - Regression Protected + State Tracked)

### Step 1: Locate

Find the exact files to change.

### Step 2: Baseline (REQUIRED if tests exist)

**Before making ANY changes:**

```bash
npm test 2>&1
```

**Record the baseline:**
- How many tests pass? (e.g., "40 tests passing")
- Any already-failing tests? (note them)

If no tests exist, note: "No existing tests - skipping baseline."

### Step 3: Change

Make the minimal change, following existing patterns.

### Step 4: Verify (REQUIRED if tests exist)

**After making changes:**

```bash
npm test 2>&1
```

**Compare to baseline:**
- Same number of tests passing? ✅ Continue
- Previously-passing test now failing? ❌ **STOP**

### Step 5: Handle Regressions

**⚠️ If any previously-passing test now fails:**

1. **Do NOT commit**
2. **Do NOT proceed**
3. **Fix the regression OR revert the change**
4. **Report what broke:**
   ```
   ❌ Regression detected
   
   Baseline: 40 tests passing
   After change: 39 tests passing
   
   Failed test: [test name]
   Likely cause: [what the change affected]
   
   Options:
   - Fix the regression
   - Revert and try different approach
   ```

### Step 6: Build Check

**Verify build still works:**

```bash
npm run build 2>&1
```

If build fails, fix before continuing.

### Step 7: Update Changelog (V8.5)

**Load skill:** 
```bash
cat .claude/skills/changelog/SKILL.md
```

Add entry to CHANGELOG.md [Unreleased] section:
- Category: Added / Changed / Fixed (based on what was done)
- Entry: User-readable description

### Step 8: Update Progress (V8.5)

If `progress.md` exists, add a note:

```markdown
### Quick Change - [timestamp]
- Change: $ARGUMENTS
- Files: [list]
- Tests: [X] before → [X] after
```

### Step 9: Commit

**Only if tests pass AND build succeeds:**

```bash
git add -A
git commit -m "fix: $ARGUMENTS" # or "chore: $ARGUMENTS"
```

---

## Quick Workflow Summary

```
┌─────────────────────────────────────────┐
│ 1. LOCATE     │ Find files to change    │
├───────────────┼─────────────────────────┤
│ 2. BASELINE   │ npm test (record count) │
├───────────────┼─────────────────────────┤
│ 3. CHANGE     │ Make minimal change     │
├───────────────┼─────────────────────────┤
│ 4. VERIFY     │ npm test (compare)      │
├───────────────┼─────────────────────────┤
│ 5. REGRESSION │ If test fails → STOP    │
├───────────────┼─────────────────────────┤
│ 6. BUILD      │ npm run build           │
├───────────────┼─────────────────────────┤
│ 7. CHANGELOG  │ Update CHANGELOG.md     │
├───────────────┼─────────────────────────┤
│ 8. PROGRESS   │ Update progress.md      │ ← V8.5
├───────────────┼─────────────────────────┤
│ 9. COMMIT     │ Only if all pass        │
└───────────────┴─────────────────────────┘
```

---

## Done

Report:
- What changed
- Files modified
- Tests: [X] passing before → [X] passing after
- Build: Success
- Changelog: Updated
- Progress: Updated (if exists)

No ceremony needed for quick changes, but **never skip the test baseline/verify cycle.**
