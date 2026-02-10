---
description: Systematic QA testing after feature implementation. Finds bugs, writes regression tests, fixes in a loop. Usage: /test ["feature"]
---

# /test - Systematic QA Testing

**Feature:** $ARGUMENTS

---

## 1. Load Skill

```bash
cat .claude/skills/test/SKILL.md
```

---

## 2. Verify

Run automated checks:

```bash
npm test && npm run build && npm run lint
```

(Adapt commands to project type: pytest, go test, cargo test, etc.)

---

## 3. Explore

- Walk through feature in browser
- Test edge cases (empty states, invalid input, error paths)
- Check console for errors

---

## 4. Fix (loop)

For each bug found:
1. Write a failing test
2. Fix the bug
3. Verify test passes
4. Commit: `fix: description`

Repeat until all checks pass.

---

## Done

- All tests pass
- Build succeeds
- No console errors
- Bugs fixed with regression tests
