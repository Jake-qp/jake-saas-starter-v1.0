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
# Build all features for a PRD (--prd required)
scripts/build-batch.sh --prd F001

# Build a single feature (auto-detects PRD from ID prefix)
scripts/build-batch.sh --feature F001-016

# Explicit PRD + feature
scripts/build-batch.sh --prd F001 --feature F001-016

# Use a different model
CLAUDE_MODEL=sonnet scripts/build-batch.sh --prd F001
```

### How It Works

1. Script reads `feature_list.json` to discover features matching the PRD prefix
2. Groups features by `batch` field, runs batches in order
3. For each feature, spawns `claude -p` with a prompt that follows the `/build-auto` workflow
4. Each session: reads CLAUDE.md, extracts feature from PRD, executes 5 phases, commits per phase
5. `phase-gate.sh` hook enforces quality gates (tests pass, build succeeds, mock data removed)
6. Completed features are skipped on re-run (checks `feature_list.json`)

### Prerequisites

Before running, ensure:
- PRD has `<!-- START_FEATURE -->` markers (for feature extraction)
- `feature_list.json` has features with `batch`, `prd`, and `status` fields
- `CHANGELOG.md` exists (Phase 5 gate checks it)
- `scripts/build-batch.sh` exists and is executable

### Multi-PRD Support

The orchestrator is PRD-generic. Each feature in `feature_list.json` has a `prd` field pointing to its PRD file. The `--prd` flag filters features by ID prefix (e.g., `--prd F001` builds features `F001-*`, `--prd F002` builds `F002-*`).

### Monitor

```bash
tail -f logs/build-<ID>.log             # Human-readable log
tail -f logs/build-<ID>.jsonl           # Raw stream-json
git log --oneline -20                    # Commits landing
cat feature_list.json | python3 -m json.tool  # Status
```

### Log Files

Each feature produces three log files:
- `logs/build-<ID>.log` — Human-readable: tool calls, assistant text, final result summary
- `logs/build-<ID>.jsonl` — Raw stream-json: every event from the Claude session
- `logs/build-<ID>.log.stderr` — Stderr output (errors from the Claude CLI itself)

### Mock Data Enforcement

The `phase-gate.sh` hook checks `app/`, `components/`, `lib/` for mock data patterns:
- Phase 2: Must have mock data (visual validation)
- Phase 4: Must remove mock data (real backend wiring)
- Phase 4: Tests must pass + build must succeed

If mock data persists, the gate fails and Claude retries (max 3 attempts before escalation).
