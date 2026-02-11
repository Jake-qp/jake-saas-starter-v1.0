---
description: Autonomously build all features from a PRD. Usage: /build-auto "PRD_ID"
---

> **Vibe System V9.4** - See `.claude/SYSTEM.md` for full documentation.

# /build-auto - Autonomous PRD Builder

**PRD ID:** $ARGUMENTS

---

## Overview

Build ALL child features from a PRD autonomously, with minimal human intervention.

```
┌─────────────────────────────────────────────────────────────────┐
│  /build-auto "F029"                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  For each child feature (F029-001, F029-002, ...):              │
│                                                                  │
│  ├─ Phase 1: Spec          → AUTO (from PRD, no invention)      │
│  ├─ Phase 2: Design        → AUTO (follow PRD UI Requirements)  │
│  ├─ Phase 3: Data Model    → AUTO (follow PRD Data Requirements)│
│  ├─ Phase 4: Build         → AUTO-VERIFY (gate enforced)        │
│  └─ Phase 5: Verify        → AUTO-VERIFY (gate enforced)        │
│                                                                  │
│  Only stops on:                                                  │
│  • Gate ESCALATION (3 failed attempts)                          │
│  • Critical ambiguity in PRD                                    │
│  • External blocker (API down, etc.)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## STEP 0: VALIDATE PRD

```bash
# Find the PRD file
PRD_ID="$ARGUMENTS"
PRD_FILE=$(ls docs/prds/${PRD_ID}-*.md 2>/dev/null | head -1)

if [ -z "$PRD_FILE" ]; then
  echo "❌ PRD not found: $PRD_ID"
  echo "Available PRDs:"
  ls docs/prds/*.md 2>/dev/null || echo "No PRDs found"
  exit 1
fi

echo "✓ Found PRD: $PRD_FILE"
```

**If PRD not found:** Stop and ask user for correct ID.

---

## STEP 1: EXTRACT CHILD FEATURES

```bash
# Extract all child feature IDs from PRD
grep -oE "<!-- START_FEATURE: ${PRD_ID}-[0-9]{3} -->" "$PRD_FILE" | \
  grep -oE "${PRD_ID}-[0-9]{3}" | sort -u
```

**Present the queue:**

```markdown
## 🚀 Autonomous Build Queue

**PRD:** [PRD_ID] - [PRD Name]
**Mode:** Autonomous (Decision Gates → Auto | Verification Gates → Auto-Verify)

| # | Feature ID | Name | Status |
|---|------------|------|--------|
| 1 | F029-001 | [Name] | ⏳ Pending |
| 2 | F029-002 | [Name] | ⏳ Pending |
| 3 | F029-003 | [Name] | ⏳ Pending |

### Auto-Mode Behavior

| Phase | Gate Type | Behavior |
|-------|-----------|----------|
| 1 (Spec) | Decision | **AUTO** - Extract from PRD, no user input |
| 2 (Design) | Decision | **AUTO** - Follow PRD UI Requirements |
| 3 (Data) | Decision | **AUTO** - Follow PRD Data Requirements |
| 4 (Build) | Verification | **AUTO-VERIFY** - Hook enforced |
| 5 (Verify) | Verification | **AUTO-VERIFY** - Hook enforced |

**Ready to start?**
- ✅ Yes, build all features autonomously
- 🔧 Exclude specific features: [list IDs]
- ❌ Cancel
```

**Wait for confirmation before proceeding.**

---

## STEP 2: INITIALIZE BATCH STATE

Create/update progress.md for batch tracking:

```markdown
# Autonomous Build Progress

## Batch Info
**PRD:** [PRD_ID]
**Mode:** Autonomous
**Started:** [timestamp]
**Features:** [count] total

## Current Feature
**ID:** [none]
**Phase:** [none]
**Gate Status:** none
**Gate Attempt:** 1

## Queue
- ⏳ F029-001: [Name]
- ⏳ F029-002: [Name]
- ⏳ F029-003: [Name]

## Completed
[none yet]

## PRD Anchor (Source of Truth)
[Will be populated per-feature]
```

---

## STEP 3: PROCESS FEATURES (Loop)

For each feature in the queue:

### 3A: Load Feature Context

```bash
# Extract FULL child feature section from PRD
FEATURE_ID="[current feature]"
sed -n "/<!-- START_FEATURE: $FEATURE_ID -->/,/<!-- END_FEATURE: $FEATURE_ID -->/p" "$PRD_FILE"
```

**Update progress.md PRD Anchor section with extracted content.**

### 3B: Execute Phases 1-3 (Auto-Decision)

**Phase 1 (Spec):**
- Create spec from PRD child feature section
- DO NOT invent requirements
- Copy acceptance criteria verbatim from PRD

**Phase 2 (Design):**
- Follow PRD's "UI Requirements" exactly
- Use existing design system
- Create mock data for visual validation

**Phase 3 (Data Model):**
- Follow PRD's "Data Requirements" exactly
- Match field names and relationships from PRD

**After each phase:**
- Update progress.md with phase completion
- Commit: `[phase]: [feature-id] [phase-name]`

### 3C: Execute Phases 4-5 (Auto-Verify)

**Before Phase 4:**

```bash
# Update progress.md to trigger gate
# The phase-gate.sh hook will enforce verification
```

Update progress.md:
```markdown
## Current Feature
**ID:** F029-001
**Phase:** 4
**Gate Status:** pending
**Gate Attempt:** 1
```

**Execute Phase 4:**
1. Load TDD skill: `cat .claude/skills/tdd/SKILL.md`
2. Record baseline test count
3. Write failing tests (RED)
4. Implement to pass (GREEN)
5. Replace mock data with real data
6. Run tests, run build

**The phase-gate.sh hook will:**
- Check if mock data is eliminated
- Check if tests pass
- Check if build succeeds
- Return exit 2 if any fail (forces retry)
- Update attempt count
- Escalate after 3 attempts

**After Phase 4 gate passes:**
- Update progress.md: `**Gate Status:** PASSED`
- Commit: `feat: [feature-id] implementation`

**Execute Phase 5:**
- Load verification skill
- Verify each PRD AC is met
- Update CHANGELOG.md
- Update feature_list.json

**After Phase 5 gate passes:**
- Update progress.md: `**Gate Status:** PASSED`
- Commit: `verify: [feature-id] complete`

### 3D: Mark Feature Complete

Update progress.md:
```markdown
## Completed
- ✅ F029-001: [Name] - [timestamp]
```

Update feature_list.json:
```json
{
  "id": "F029-001",
  "status": "complete",
  "phase_completed": 5,
  "completed_at": "[timestamp]"
}
```

### 3E: Next Feature

Move to next feature in queue. Repeat from 3A.

---

## STEP 4: BATCH COMPLETION

When all features are complete:

```markdown
## 🎉 Autonomous Build Complete

**PRD:** [PRD_ID] - [Name]
**Duration:** [time]
**Features Built:** [count]

### Results

| Feature | Status | Tests Added | Time |
|---------|--------|-------------|------|
| F029-001 | ✅ Complete | +8 | 12min |
| F029-002 | ✅ Complete | +5 | 8min |
| F029-003 | ✅ Complete | +6 | 10min |

### Commits
- `spec: F029-001 specification`
- `design: F029-001 UI components`
- `arch: F029-001 data model`
- `feat: F029-001 implementation`
- `verify: F029-001 complete`
- [... more commits ...]

### Next Steps
- Review changes: `git log --oneline -20`
- Run full test suite: `npm test`
- Check build: `npm run build`
- Push to remote: `git push`
```

Update PRD status in feature_list.json:
```json
{
  "id": "F029",
  "status": "complete",
  "completed_at": "[timestamp]"
}
```

---

## ESCALATION HANDLING

If phase-gate.sh escalates (3 failed attempts):

```markdown
## ⚠️ Build Paused - Escalation Required

**Feature:** [ID]
**Phase:** [X]
**Issue:** [description]

### Failed Attempts
1. [what was tried]
2. [what was tried]
3. [what was tried]

### Options
- 🔧 **Help fix:** Provide guidance on the issue
- ⏭️ **Skip feature:** Mark as blocked, continue to next
- 🔄 **Retry:** Reset attempt counter and try again
- ❌ **Stop batch:** End autonomous processing
```

**Wait for user input before proceeding.**

---

## BACKEND-ONLY FEATURES

Features with `type: "backend"` (no UI) may skip Phases 2-3:
- **Phase 2 (Design):** Skip — no UI to design, no mock data needed
- **Phase 3 (Data Model):** Skip if no new tables — document in commit message

The feature still requires Phase 1 (Spec), Phase 4 (Build/TDD), and Phase 5 (Verify).
Commit sequence for backend-only: `spec:` → `feat:` → `verify:` (3 commits instead of 5).

---

## MULTI-SESSION MODE (Batch Orchestrator)

For building all PRD features at scale, use `scripts/build-batch.sh` instead of `/build-auto`:

```bash
scripts/build-batch.sh                    # All features, fresh session per feature
scripts/build-batch.sh --feature F001-XXX # Single feature (dry run / retry)
```

**Why:** A single session hits context compaction after ~3 features. The batch orchestrator spawns a fresh `claude -p` session per feature, preserving quality.

**Docs:** `docs/build-batch-orchestrator.md`

---

## CRITICAL RULES

### PRD Compliance (Non-Negotiable)

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ PRD IS THE ONLY SOURCE OF TRUTH                            │
│                                                                  │
│  • DO NOT invent features not in PRD                            │
│  • DO NOT add "nice to have" functionality                      │
│  • DO NOT expand scope beyond PRD                               │
│  • DO NOT skip PRD requirements                                 │
│                                                                  │
│  If PRD is ambiguous → STOP and ask                             │
│  If PRD seems incomplete → STOP and ask                         │
│  If you want to add something → STOP and ask                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Quality Gates (Hook-Enforced)

| Phase | Must Have | Checked By |
|-------|-----------|------------|
| 2 | Mock data exists | phase-gate.sh |
| 4 | Mock data removed | phase-gate.sh |
| 4 | Tests pass | phase-gate.sh |
| 4 | Build succeeds | phase-gate.sh |
| 5 | CHANGELOG updated | phase-gate.sh |
| 5 | feature_list.json updated | phase-gate.sh |

### Commit Discipline

One commit per phase:
```
spec: F029-001 user authentication
design: F029-001 login form components
arch: F029-001 user data model
feat: F029-001 authentication flow
verify: F029-001 complete
```

---

## DONE

Autonomous build complete. All features from PRD have been built with:
- Full PRD compliance (no invented features)
- Hook-enforced quality gates
- Automatic retry on failures
- Escalation only when truly stuck
