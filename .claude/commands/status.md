---
description: Show current project state with feature tracking. Usage: /status
---

> **Vibe System V8.8** - See `.claude/SYSTEM.md` for full documentation.

# /status - Current State

---

## Quick Status

```bash
# Project
head -1 CLAUDE.md

# Branch
git branch --show-current

# Uncommitted changes
git status --porcelain | wc -l

# Last commit
git log --oneline -1
```

---

## Feature Tracking (V8.5)

```bash
# Parse feature_list.json
cat feature_list.json 2>/dev/null
```

**Display format:**

```
📊 Feature Status
─────────────────────────────────────

✅ COMPLETE
   • [id]: [description] ([X] tests)
   • [id]: [description] ([X] tests)

🔄 IN PROGRESS
   • [id]: [description]
     Phase [X] - [Phase Name]
     Last: [last checkpoint]
     Next: [what to do next]

⏳ PENDING
   • [id]: [description]
   • [id]: [description]

─────────────────────────────────────
```

---

## Test Health

```bash
npm test 2>&1 | tail -10
```

---

## Recent Activity

```bash
git log --oneline -5
```

---

## Progress Notes (V8.5)

```bash
# Show latest session from progress.md
head -40 progress.md 2>/dev/null
```

---

## Pending Tasks

```bash
grep "^\[ \]" .tasks 2>/dev/null | head -5
```

---

## Recommendations

Based on current state:

**If in_progress feature exists:**
> Continue with [feature name], Phase [X] - [phase name]
> Run: `cat docs/specs/[feature].spec` to refresh context

**If uncommitted changes exist:**
> Commit before proceeding
> Run: `git status` to see what's pending

**If tests failing:**
> Run `/fix` before new work
> Run: `npm test` to see failures

**If no in-progress features:**
> Ready for new work
> Run: `/build "feature"` or `/quick "change"`

---

## Full Status Report

When running /status, compile:

```
## Project Status Report

### Project
- Name: [from CLAUDE.md]
- Branch: [current branch]
- Last commit: [message]
- Uncommitted changes: [count]

### Features (V8.5)
- Complete: [X]
- In Progress: [X] (currently on Phase [X])
- Pending: [X]

### Tests
- Status: [passing/failing]
- Count: [X] tests

### Session
- progress.md: [exists/missing]
- feature_list.json: [exists/missing]

### Recommended Action
[Based on state above]
```
