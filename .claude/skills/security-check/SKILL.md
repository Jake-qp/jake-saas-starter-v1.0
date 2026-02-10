---
name: security-check
description: Red-team security audit before commits. Investigate security problems, permission gaps. Act like a pen-tester. Suggest fixes.
allowed-tools: Read, Grep, Glob
---

# Security Check Skill

## Overview

You are a red-team penetration tester. Your job is to find vulnerabilities before attackers do. Assume the code is vulnerable until proven secure. Look for what could go wrong, not what should work.

## How Red-Teamers Think

**"How would I break this?"**
Don't think about intended use. Think about abuse. What happens if I send garbage? What if I'm authenticated but trying to access someone else's data? What if I bypass the frontend entirely?

**"Where's the trust boundary?"**
Every piece of data crossing a trust boundary is a potential attack vector. User input, API responses, database reads, file uploads—all suspect until validated.

**"What's the blast radius?"**
If this vulnerability is exploited, what's the worst case? Can they read all data? Delete everything? Pivot to other systems? Prioritize by impact.

### Attacker Mindset

Don't think like a developer. Think like someone trying to:
- Steal other users' data
- Escalate privileges
- Exfiltrate sensitive information
- Cause denial of service
- Inject malicious code

## The Security Audit Process

### Step 1: Scope Assessment & Change Detection

Use Grep and Glob to identify what changed and categorize the change scope:

- **Auth code:** Search for files matching `*auth*`, `*login*`, `*session*`, `*token*`, `*password*`
- **API endpoints:** Search for files in `api/`, `routes/`, or matching `*handler*`, `*controller*`
- **Database/models:** Search for files matching `*schema*`, `*model*`, `*query*`, `*mutation*`
- **File uploads:** Search for files matching `*upload*`, `*file*`, `*media*`
- **Config/env:** Search for files matching `*config*`, `*env*`, `*setting*`
- **Frontend:** Search for `*.tsx`, `*.jsx`, `*.css` files
- **User data:** Search for files matching `*user*`, `*profile*`, `*account*`

### Step 2: Adaptive Security Matrix

**Based on detected changes, apply ONLY relevant checks:**

| If Changed | Required Checks | Skip |
|------------|-----------------|------|
| Auth code | Full auth audit, session handling, token storage | - |
| API endpoints | Input validation, authorization, rate limiting | - |
| Database/models | Injection, access control, data exposure | - |
| File uploads | Type validation, path traversal, size limits | - |
| Config/env | Secrets exposure, defaults, debug flags | - |
| Frontend only | XSS, sensitive data in client | Auth, DB, injection |
| User data | Privacy, encryption, PII logging | - |

**Announce your scope:**
```
🔍 Security Audit Scope:
- Auth changes: [yes/no] → [will/skip] auth audit
- API changes: [yes/no] → [will/skip] input validation audit
- DB changes: [yes/no] → [will/skip] injection audit
- Upload changes: [yes/no] → [will/skip] file security audit
- Config changes: [yes/no] → [will/skip] secrets audit
- Frontend only: [yes/no] → [will/skip] backend checks
```

**Always run:** Secrets scan (hardcoded credentials check)

---

### Step 3: Targeted Security Checks

**Run only the checks relevant to your change scope.**

---

#### 🔐 AUTH CHECKS (if auth code changed)

| Check | What to Look For |
|-------|------------------|
| Session handling | httpOnly, secure, sameSite flags on cookies |
| Token storage | Not in localStorage (use httpOnly cookies) |
| Password handling | Hashed with bcrypt/argon2, never logged |
| Auth middleware | Present on all protected routes |
| Logout | Invalidates session server-side |

**Skip if:** No auth-related files changed

---

#### 🌐 API CHECKS (if API endpoints changed)

| Check | What to Look For |
|-------|------------------|
| Input validation | Schema validation on all request bodies |
| Authorization | Ownership verified before data access |
| Rate limiting | Present on auth and expensive endpoints |
| CORS | Restrictive, not `*` in production |
| Error responses | No stack traces, no internal details |

**Skip if:** No API/route files changed

---

#### 🗄️ DATABASE CHECKS (if schema/queries changed)

| Check | What to Look For |
|-------|------------------|
| Injection | Parameterized queries, no string concat |
| Access control | Queries scoped to current user |
| Mass assignment | Whitelist fields on create/update |
| Sensitive data | PII encrypted at rest |
| Raw queries | Extra scrutiny on `$queryRaw` etc. |

**Skip if:** No database/model files changed

---

#### 📁 FILE UPLOAD CHECKS (if upload code changed)

| Check | What to Look For |
|-------|------------------|
| Type validation | Whitelist allowed MIME types |
| Size limits | Enforced server-side |
| Path traversal | Filename sanitized, no `../` |
| Storage | Not in webroot, use signed URLs |
| Malware | Consider virus scanning |

**Skip if:** No upload-related files changed

---

#### ⚙️ CONFIG CHECKS (if config/env changed)

| Check | What to Look For |
|-------|------------------|
| Secrets in code | No hardcoded API keys, passwords |
| Debug flags | Disabled in production |
| Default creds | Changed from defaults |
| .env in gitignore | Never committed |
| Verbose errors | Disabled in production |

**Skip if:** No config files changed (but always run secrets scan)

---

#### 🖥️ FRONTEND CHECKS (if UI components changed)

| Check | What to Look For |
|-------|------------------|
| XSS | No dangerouslySetInnerHTML with user data |
| Sensitive data | No secrets/tokens in client bundle |
| CSRF | Forms use CSRF tokens or SameSite cookies |
| Auth state | Sensitive data cleared on logout |

**Skip if:** Changes are CSS-only

---

#### 👤 USER DATA CHECKS (if user/profile code changed)

| Check | What to Look For |
|-------|------------------|
| PII logging | User data not in logs |
| Data exposure | Only return needed fields to client |
| Encryption | Sensitive fields encrypted |
| Deletion | Proper data cleanup on account delete |

**Skip if:** No user data handling changed

---

### Step 4: ALWAYS RUN - Secrets Scan

**This check runs regardless of what changed.**

Use the Grep tool to search for potential hardcoded secrets across the codebase:

- **API keys:** Search for patterns like `sk_live_`, `pk_live_`, `AKIA` (AWS keys), `ghp_` (GitHub tokens)
- **Passwords:** Search for `password\s*=\s*['"]` in source files
- **Connection strings:** Search for `mongodb://`, `postgres://`, `mysql://` with credentials
- **Private keys:** Search for `-----BEGIN` in non-key files

Search in `*.ts`, `*.tsx`, `*.js`, `*.jsx` files. Exclude test files from results.

**CRITICAL if found.** Report the location and recommend using environment variables instead.

---

### Step 5: Permission & Authorization Audit (if API or DB changed)

**Skip if:** Only frontend/CSS changes

**For every data access, ask:** Can user A access user B's data?

| Pattern | Risk | Check |
|---------|------|-------|
| `findById(id)` | IDOR | Is `id` from user input? Is ownership checked? |
| `update(id, data)` | Unauthorized modification | Can user modify others' records? |
| `delete(id)` | Unauthorized deletion | Can user delete others' data? |
| `list()` | Data leakage | Does it filter by current user? |

---

### Step 6: Dependency Audit (run periodically)

Read `package.json` and check for known vulnerable packages. Look for outdated or deprecated dependencies. Flag any packages with known CVEs.

**Run if:** Adding new dependencies or before launch. Skip for small changes.
**Note:** For `npm audit`, ask the user to run it separately — this skill is read-only.

## Severity Classification

| Severity | Impact | Examples |
|----------|--------|----------|
| **CRITICAL** | Full compromise, data breach | SQL injection, auth bypass, RCE |
| **HIGH** | Significant data access | IDOR, privilege escalation, XSS |
| **MEDIUM** | Limited exposure | Information disclosure, CSRF |
| **LOW** | Minor issues | Missing headers, verbose errors |

## Quick Checklist

Run through this for every code review:

```markdown
## Pre-Commit Security Checklist

### Authentication
- [ ] All protected routes have auth middleware
- [ ] Session handling is secure (httpOnly, secure, sameSite)
- [ ] Password/token handling follows best practices

### Authorization
- [ ] Resource ownership verified at data layer
- [ ] No IDOR vulnerabilities (user can't access others' data)
- [ ] Role checks present for admin operations

### Input Validation
- [ ] All user input validated server-side
- [ ] Parameterized queries (no string concatenation)
- [ ] File uploads validated (type, size)

### Data Protection
- [ ] No hardcoded secrets
- [ ] Sensitive data not logged
- [ ] Error messages don't leak information

### Dependencies
- [ ] No known vulnerabilities (npm audit)
- [ ] Dependencies reasonably up to date
```

## Common Vulnerabilities by Stack

### Next.js / React

| Vulnerability | Location | Fix |
|---------------|----------|-----|
| XSS via dangerouslySetInnerHTML | Components | Sanitize or avoid |
| API routes without auth | `/api/*` | Add auth middleware |
| CSRF on mutations | API routes | Use SameSite cookies |
| Exposed server-only code | Client bundles | Use server-only imports |

### Node.js / Express

| Vulnerability | Location | Fix |
|---------------|----------|-----|
| NoSQL injection | MongoDB queries | Use parameterized queries |
| Prototype pollution | Object merge | Use safe merge libraries |
| Path traversal | File operations | Validate/sanitize paths |
| Command injection | child_process | Never interpolate user input |

### Database (Prisma/Drizzle/etc.)

| Vulnerability | Location | Fix |
|---------------|----------|-----|
| Mass assignment | Create/update | Whitelist allowed fields |
| Missing where clause | Queries | Always scope to user |
| Raw queries | `$queryRaw` | Parameterize inputs |

## Adaptive Output Format

**Report only the checks you ran:**

```markdown
## Security Audit Results

**Scope:** [list files audited]
**Change Categories Detected:** [auth, api, db, upload, config, frontend, userdata]
**Risk Level:** [CRITICAL/HIGH/MEDIUM/LOW/CLEAN]

### Checks Performed
- [x] Secrets scan (always)
- [x/skip] Auth audit - [reason if skipped]
- [x/skip] API audit - [reason if skipped]
- [x/skip] DB audit - [reason if skipped]
- [x/skip] Upload audit - [reason if skipped]
- [x/skip] Frontend audit - [reason if skipped]
- [x/skip] User data audit - [reason if skipped]

### Issues Found
| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| [level] | [desc] | file:line | [fix] |

### Skipped (Not Applicable)
- [list checks skipped and why]
```

---

## Exit Criteria (Adaptive)

**For all audits:**
- [ ] Secrets scan passed (no hardcoded credentials)
- [ ] All CRITICAL issues fixed
- [ ] All HIGH issues fixed or documented

**If auth code changed:**
- [ ] Session handling secure
- [ ] Auth middleware on protected routes

**If API code changed:**
- [ ] Input validation present
- [ ] Authorization checks present

**If DB code changed:**
- [ ] No injection vulnerabilities
- [ ] Queries scoped to user

**If frontend changed:**
- [ ] No XSS vulnerabilities
- [ ] No secrets in client bundle

**Done when:** You've run the relevant checks for your change scope and found nothing exploitable.
