---
description: Finalize a feature after Phase 5 with security check, documentation verification, and commit+push. Usage: /feature-finish
---

> **Vibe System V10** - See `.claude/SYSTEM.md` for full documentation.

# /feature-finish - Finalize Feature and Ship

Run this command after completing Phase 5 of `/build` to:
1. Verify security checks completed
2. Verify documentation linkage (traversability)
3. Commit and push

---

## Why Document Traversability Matters

Claude Code loads context by traversing document indexes. If indexes aren't updated with proper links, the agent cannot find what was built:

```
docs/specs/readme.md (The Pin)
       ↓ links to
Feature Specs table → individual .spec files
       ↓ links to
Spec Navigation table → IMPLEMENTATION_PLAN.md, PRD, Architecture
       ↓ links to
ARCHITECTURE.md Feature Index → spec files
       ↓
feature_list.json → status, phase, spec_file path
```

**If any link is broken or missing:**
- Future sessions can't find the feature
- Context loading fails silently
- The agent "forgets" what exists

---

## Step 0: Load Skills & Rules (MANDATORY)

```bash
# Security expertise
cat .claude/skills/security-check/SKILL.md

# Verification protocol
cat .claude/skills/verification/SKILL.md

# Documentation standards
cat .claude/skills/documentation/SKILL.md

# Documentation rules
cat .claude/rules/documentation-updates.md
cat .claude/rules/spec-linking.md
```

**Do not proceed until all skills are loaded.**

---

## Step 1: Security Audit

Follow the security-check skill's adaptive process:

### 1.1 Detect What Changed

```bash
git diff --name-only HEAD~1
```

### 1.2 Categorize Changes

| Category | Indicators | Checks Required |
|----------|------------|-----------------|
| Auth | `auth/`, login, session | Full auth audit |
| API | `api/`, routes, endpoints | Input validation, authorization |
| Database | schema, migration, queries | Injection, access control |
| Frontend | components, pages | XSS, client secrets |
| Config | `.env`, config files | Secrets exposure |

### 1.3 Run Targeted Checks

Follow the security-check skill workflow based on detected categories.

### 1.4 Report

```markdown
## Security Audit Summary

| Category | Checks Run | Status |
|----------|------------|--------|
| Secrets scan | Always | ✅/❌ |
| [detected] | [checks] | ✅/❌ |

**Issues Found:** [None / List CRITICAL/HIGH issues]
```

**BLOCK if CRITICAL or HIGH issues found.** Fix before proceeding.

---

## Step 2: Documentation Verification

### 2.1 Identify Feature ID

Check `progress.md` for current feature:

```bash
grep -E "Feature ID|F[0-9]{3}-[0-9]{3}" progress.md | head -3
```

If unclear, ask user for feature ID.

### 2.2 Verification Skill Step 6 (Documentation Updates)

Verify each is complete:

| Document | Check | Status |
|----------|-------|--------|
| CHANGELOG.md | Has entry under `[Unreleased]` | ✅/❌ |
| progress.md | REPLACED (not appended) with completion | ✅/❌ |
| feature_list.json | status = "complete" | ✅/❌ |
| docs/architecture/features.md | Implementation details (if needed) | ✅/❌/N/A |
| ARCHITECTURE.md | Feature Index entry (if new feature) | ✅/❌/N/A |

### 2.3 Traversability Chain Verification

**Verify each link in the chain exists:**

#### A. The Pin (docs/specs/readme.md)

```bash
grep "FEATURE_ID" docs/specs/readme.md
```

Should have row with link to spec file.

#### B. Spec File Navigation Table

```bash
head -30 docs/specs/FEATURE_ID-*.spec
```

Should have Navigation table with links to:
- IMPLEMENTATION_PLAN.md#feature-anchor
- PRD section anchor
- Specs Index (readme.md)

#### C. ARCHITECTURE.md Feature Index

```bash
grep "FEATURE_ID" ARCHITECTURE.md
```

Should have row in Feature Index table.

#### D. feature_list.json

```bash
jq '.features[] | select(.id == "FEATURE_ID")' feature_list.json
```

Should have `spec_file` path entry.

### 2.4 Report Gaps

If gaps found:

```markdown
## Documentation Gaps Found

| Gap | Location | Status |
|-----|----------|--------|
| [Missing spec index entry] | docs/specs/readme.md | ❌ |
| [Missing Navigation table] | docs/specs/F001-001.spec | ❌ |

**What would you like to do?**
1. Fix these gaps now
2. Skip and continue (not recommended)
3. Abort
```

Wait for user input before proceeding.

---

## Step 3: Final Verification

### 3.1 Run Tests

```bash
npm test 2>&1
```

**BLOCK if tests fail.** Fix before proceeding.

### 3.2 Run Build

```bash
npm run build 2>&1
```

**BLOCK if build fails.** Fix before proceeding.

### 3.3 Check for Sensitive Files

```bash
git status --short | grep -E '\.env|credentials|secret|key|password'
```

If sensitive files are staged, **BLOCK** and alert user.

---

## Step 4: Commit & Push

### 4.1 Generate Commit Message

Extract from CHANGELOG.md `[Unreleased]` section:

```bash
sed -n '/## \[Unreleased\]/,/## \[/p' CHANGELOG.md | head -20
```

Format: `feat(FEATURE_ID): <first changelog entry>`

### 4.2 Stage & Commit

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(FEATURE_ID): <description>

<additional changelog entries if multiple>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### 4.3 Push

```bash
git push
```

---

## Step 5: Report Completion

```markdown
## Feature Finalized

| Item | Status |
|------|--------|
| Security audit | ✅ Passed |
| Documentation | ✅ Complete |
| Tests | ✅ Passing |
| Build | ✅ Success |
| Commit | ✅ [hash] |
| Push | ✅ [branch] |

**Feature FEATURE_ID is complete and shipped.**
```

---

## Workflow Summary

```
┌─────────────────────────────────────────┐
│           /feature-finish               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  0. LOAD SKILLS & RULES                 │
│  - security-check, verification         │
│  - documentation, rules                 │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  1. SECURITY AUDIT                      │
│  - Adaptive based on git diff           │
│  - Block if CRITICAL/HIGH              │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  2. DOC VERIFICATION                    │
│  - Verification skill Step 6            │
│  - Traversability chain check           │
│  - If gaps → ASK what to do             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  3. FINAL CHECKS                        │
│  - npm test (must pass)                 │
│  - npm run build (must succeed)         │
│  - No sensitive files staged            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  4. COMMIT & PUSH                       │
│  - Generate commit from CHANGELOG       │
│  - Commit with co-author                │
│  - Auto-push to remote                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  ✅ Feature Complete                    │
│  Display: commit hash, branch           │
└─────────────────────────────────────────┘
```
