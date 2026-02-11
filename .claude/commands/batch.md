---
description: Process multiple tasks or build all PRD features autonomously. Usage: /batch
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /batch - Batch Processing Mode

Two modes: **Task Batch** (process .tasks file) and **Build Batch** (build all PRD features via fresh sessions).

---

## Mode 1: Task Batch

Process tasks from .tasks file.

### Prerequisites

1. .tasks file exists with pending tasks
2. Each task is well-defined
3. Maximum 5-7 tasks per batch

### Batch Execution

For each task:

1. **Determine type** - Is it /quick, /build, or /fix?
2. **Execute** - Follow appropriate workflow
3. **Mark complete** - `[x] Task (YYYY-MM-DD)`
4. **Commit** - After each task

### Gates (Auto Mode)

For /build tasks in batch mode, gates are automatic:
- Phase 3 complete when: `npm test` shows failing tests
- Phase 4 complete when: `npm test` shows passing tests
- Phase 5 complete when: `npm run build` succeeds

### REVIEW Tasks

When encountering `[REVIEW]` tag:
1. Stop batch processing
2. Notify user
3. Wait for approval

### Completion

```markdown
## Batch Run - [Date]
- Completed: X tasks
- Stuck: Y tasks (marked [!])
- Time: ~Z minutes
```

---

## Mode 2: Build Batch (PRD Orchestrator)

Build all features from a PRD using `scripts/build-batch.sh`. Each feature gets a **fresh Claude Code session** to avoid context compaction.

**Full documentation:** `docs/build-batch-orchestrator.md`

### Quick Start

```bash
# Build all features (5 batches, dependency order)
scripts/build-batch.sh

# Build a single feature (dry run / retry)
scripts/build-batch.sh --feature F001-016

# Use a different model
CLAUDE_MODEL=sonnet scripts/build-batch.sh
```

### How It Works

1. Script loops over 5 batches of features in dependency order
2. For each feature, spawns `claude -p` with a prompt that follows the `/build-auto` workflow
3. Each session: reads CLAUDE.md, extracts feature from PRD, executes 5 phases, commits per phase
4. `phase-gate.sh` hook enforces quality gates (tests pass, build succeeds, mock data removed)
5. Completed features are skipped on re-run (checks `feature_list.json`)

### Prerequisites

Before running, ensure:
- PRD has `<!-- START_FEATURE -->` markers (for feature extraction)
- `feature_list.json` has all 17 features with correct statuses
- `CHANGELOG.md` exists (Phase 5 gate checks it)
- `scripts/build-batch.sh` exists and is executable
- `logs/` directory exists

### Build Sequence

```
Batch 1: F001-001 (Auth) + F001-014 (Prod Infra) + F001-016 (Testing)
Batch 2: F001-003 (Billing) + F001-009 (Analytics) + F001-012 (Marketing) + F001-017 (File Storage)
Batch 3: F001-004 (RBAC)
Batch 4: F001-005 (AI) + F001-006 (Notif) + F001-007 (Onboard) + F001-008 (Flags) + F001-011 (Notes) + F001-013 (Blog)
Batch 5: F001-010 (Admin) + F001-015 (Waitlist)
```

### Monitor

```bash
tail -f logs/build-F001-XXX.log    # Current feature
git log --oneline -20               # Commits landing
cat feature_list.json | python3 -m json.tool  # Status
```

### Mock Data Enforcement

The `phase-gate.sh` hook checks `app/`, `components/`, `lib/` for mock data patterns:
- Phase 2: Must have mock data (visual validation)
- Phase 4: Must remove mock data (real backend wiring)
- Phase 4: Tests must pass + build must succeed

If mock data persists, the gate fails and Claude retries (max 3 attempts before escalation).
