---
description: Red-team security audit before commit. Usage: /security-check
---

> **Vibe System V8.8** - See `.claude/SYSTEM.md` for full documentation.

# /security-check - Adaptive Pre-Commit Security Audit

Run this before committing to catch security issues. The audit adapts based on what you changed.

---

## Load Skill

```bash
cat .claude/skills/security-check/SKILL.md
```

---

## How It Works (Adaptive)

1. **Detect what changed:**
```bash
git diff --name-only HEAD~5
git diff --cached --name-only
```

2. **Categorize changes** → Determines which checks run:

| If Changed | Checks Run | Checks Skipped |
|------------|------------|----------------|
| Auth code | Full auth audit | - |
| API endpoints | Input validation, authorization | - |
| Database code | Injection, access control | - |
| File uploads | Type/size validation, path traversal | - |
| Frontend only | XSS, client secrets | Backend checks |
| CSS only | Minimal | Most checks |
| Config files | Secrets exposure, debug flags | - |

3. **Always run:** Secrets scan (hardcoded credentials)

4. **Report** using adaptive format from skill

---

## Audit Modes

**Quick (default):** Adaptive audit of recent changes
- Detects change categories
- Runs targeted checks
- Skips irrelevant checks

**Deep:** Full audit (use for launch or major features)
- All checks regardless of what changed
- Full dependency audit
- All API endpoints reviewed

```
/security-check deep
```

---

## Exit Criteria

- [ ] Secrets scan passed (always required)
- [ ] All CRITICAL issues fixed
- [ ] All HIGH issues fixed or documented
- [ ] Relevant checks for change scope passed

**Done when:** You've run the checks appropriate for your changes and found nothing exploitable.
