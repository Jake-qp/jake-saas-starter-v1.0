---
description: Safely improve code without changing behavior. Usage: /refactor "goal"
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /refactor - Safe Code Improvement

**Goal:** $ARGUMENTS

---

## Pre-Flight: Load Project Knowledge Index (The Pin)

**Before refactoring, understand the project context:**

```bash
cat docs/specs/readme.md
```

After reading, announce: "✓ The Pin loaded"

**The Pin helps you:**
- Understand existing patterns and conventions
- Find related modules that may need similar updates
- Avoid refactoring in ways that contradict architecture decisions

---

## Rules

1. **No behavior changes** - tests must pass without modification
2. **Small steps** - one refactoring at a time
3. **Commit often** - each step independently revertable
4. **Tests required** - ensure coverage exists before refactoring

---

## Modernizing External Dependencies (V8.7)

When refactoring code that uses external libraries:

### Before Refactoring

1. **Check current best practices:**
   ```
   ref_search_documentation("[library] best practices")
   ```

2. **Verify API hasn't changed:**
   ```
   ref_search_documentation("[library] [method] current")
   ```

3. **Check for breaking changes:**
   ```
   ref_search_documentation("[library] migration guide")
   ```

### Why This Matters

Claude's training data may contain patterns that are:
- Deprecated (still works but not recommended)
- Removed (will cause errors)
- Superseded (better approach now available)

**Example:** Refactoring to add React Query
```
❌ Write useQuery with options from training data
✅ ref_search_documentation("React Query v5 useQuery") → Use current API
```

### Refactoring Checklist

- [ ] Checked current library version in package.json
- [ ] Verified current API with ref_search_documentation
- [ ] Updated to current patterns (not training data patterns)
- [ ] Tests still pass after refactor

---

## Phase 1: Safety Check

Do tests exist for the code being refactored?
- Yes → proceed
- No → write tests first OR use `/harden` first

Create checkpoint:
```bash
git stash  # or commit current work
```

---

## Phase 2: Execute

For each refactoring step:
1. Make ONE change
2. Run tests immediately
3. If pass: commit
4. If fail: revert, rethink

```bash
npm test && git commit -m "refactor: [what changed]"
```

---

## Phase 3: Verify

- All tests pass
- Behavior unchanged
- Code measurably better

---

## Phase 4: Update Changelog (V8.4.3)

**Load skill:** `.claude/skills/changelog/SKILL.md`

Add entry to CHANGELOG.md [Unreleased] section:
- Category: **Changed**
- Entry: Description of what was improved

Example: "Changed: Consolidated authentication logic into single module"

---

## If Something Breaks

```bash
git stash pop  # or reset to checkpoint
```

Refactoring should NEVER break things.

---

## Done

Report:
- What was refactored
- Tests: All passing
- Behavior: Unchanged
- Changelog: Updated
