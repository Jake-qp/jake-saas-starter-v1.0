---
description: Production readiness check. Usage: /launch
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /launch - Production Readiness Check

---

## Pre-Launch Gate

Before running checklist, verify:

```bash
# Tests exist and pass
npm test 2>&1

# Build succeeds
npm run build 2>&1
```

**If no tests exist:** Run `/harden` first. Cannot launch without tests.

---

## Checklist

### 🔒 Security
Load: `.claude/skills/security/SKILL.md`

- [ ] Authentication correct
- [ ] Authorization on protected routes
- [ ] No secrets in code
- [ ] HTTPS enforced
- [ ] Input validation
- [ ] Rate limiting

### ⚡ Performance
- [ ] No N+1 queries
- [ ] Proper indexing
- [ ] Assets optimized
- [ ] Caching strategy

### 🛡️ Reliability
- [ ] Error handling comprehensive
- [ ] Health check endpoint
- [ ] Rollback plan documented

### 📊 Operations
Load: `.claude/skills/devops/SKILL.md`

- [ ] Logging sufficient
- [ ] Monitoring configured
- [ ] CI/CD working
- [ ] Deployment runbook exists

### 📝 Documentation
- [ ] README current
- [ ] API docs complete
- [ ] Setup instructions work

---

## Launch Blockers

**Cannot launch without:**
- Test coverage
- Error handling on critical paths
- Rollback plan

---

## Approval

Generate `docs/LAUNCH-CHECKLIST.md` with sign-off sections.
