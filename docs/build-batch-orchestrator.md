# Build Batch Orchestrator

> **Purpose:** Build all 17 PRD modules autonomously by spawning a fresh Claude Code session per feature.
> **Status:** Validated and ready to run
> **Last Updated:** 2026-02-11

---

## Why This Exists

Building all 17 modules in a single Claude Code session causes context window compaction after ~3 features, degrading output quality. The batch orchestrator solves this by running `claude -p` (print mode) per feature — each gets a fresh context window, reads CLAUDE.md automatically, follows the Vibe System's 5-phase build workflow, and exits when done.

---

## How It Works

```
scripts/build-batch.sh
│
├─ For each batch (5 batches, sequential):
│  └─ For each feature in batch (sequential):
│     │
│     ├─ Check feature_list.json — skip if "complete"
│     ├─ Build prompt with feature ID + PRD reference
│     ├─ Run: claude -p "$PROMPT" --dangerously-skip-permissions --model opus
│     ├─ Log output to logs/build-F001-XXX.log
│     └─ Check exit code → PASS or FAIL
│
├─ Between batches: check for failures, decide continue/stop
└─ Print summary: passed, failed, duration
```

Each `claude -p` session:
1. Reads CLAUDE.md automatically (project conventions)
2. Reads `.claude/commands/build-auto.md` (the 5-phase workflow)
3. Extracts feature requirements from PRD via `<!-- START_FEATURE -->` markers
4. Executes Phases 1-5 (Spec → Design → Data Model → Build → Verify)
5. Commits after each phase with semantic prefix (spec:, design:, arch:, feat:, verify:)
6. Updates `feature_list.json` on completion

State carries between sessions via git commits — the next session sees all previous work.

---

## Build Sequence

Features are built in 5 dependency-ordered batches:

```
Batch 1 — Foundation (P0):
  F001-001 (Auth) + F001-014 (Prod Infra) + F001-016 (Testing)
  [F001-002 Design System is DONE — skip]

Batch 2 — Monetization + Marketing (P1):
  F001-003 (Billing) + F001-009 (Analytics) + F001-012 (Marketing) + F001-017 (File Storage)

Batch 3 — RBAC (P1):
  F001-004 (Enhanced RBAC)

Batch 4 — Product Features (P2):
  F001-005 (AI) + F001-006 (Notifications) + F001-007 (Onboarding)
  + F001-008 (Feature Flags) + F001-011 (Notes) + F001-013 (Blog)

Batch 5 — Operations (P3):
  F001-010 (Super Admin) + F001-015 (Waitlist)
```

**Why sequential within batches?** Running multiple `claude -p` sessions simultaneously causes git conflicts. Features within each batch run one at a time.

**Why batches are sequential?** Dependencies — Batch 2 needs Auth from Batch 1, Batch 3 needs Billing from Batch 2, etc.

---

## Usage

### Run all features
```bash
scripts/build-batch.sh
```

### Run a single feature (dry run / retry)
```bash
scripts/build-batch.sh --feature F001-016
```

### Use a different model
```bash
CLAUDE_MODEL=sonnet scripts/build-batch.sh
```

### Monitor progress
```bash
# Watch current build log
tail -f logs/build-F001-XXX.log

# Check commits landing
git log --oneline -20

# Check completion status
cat feature_list.json | python3 -m json.tool | grep -A2 '"status"'
```

### Resume after failure
The script checks `feature_list.json` before each feature. If a feature is marked `"complete"`, it's skipped. So you can:
1. Fix whatever caused the failure
2. Re-run `scripts/build-batch.sh` — it picks up where it left off

If a feature failed mid-build (partial commits exist), the next session's prompt tells Claude to continue from where it left off.

---

## Prerequisites

Before running, ensure these exist:

| Prerequisite | Purpose | How to verify |
|---|---|---|
| PRD feature markers | `build-auto` extracts per-feature ACs via `sed` | `grep "START_FEATURE" docs/prds/F001-saas-boilerplate-v2.md` |
| `feature_list.json` | All 17 features with correct statuses | `cat feature_list.json \| python3 -m json.tool` |
| `CHANGELOG.md` | Phase 5 gate checks for entries | `cat CHANGELOG.md` |
| `scripts/build-batch.sh` | The orchestrator script | `ls -la scripts/build-batch.sh` |
| `logs/` directory | Per-feature build logs | `ls logs/` |

All prerequisites are created by the implementation steps below.

---

## Key Design Decisions

### CLI Flags Used

| Flag | Purpose |
|------|---------|
| `claude -p "prompt"` | Non-interactive print mode — fresh session, reads CLAUDE.md, exits when done |
| `--dangerously-skip-permissions` | Bypasses permission prompts for autonomous execution |
| `--model opus` | Best quality for complex multi-phase builds (overridable via `CLAUDE_MODEL`) |
| `--no-session-persistence` | Prevents session files from accumulating on disk |
| `--output-format stream-json` | Captures all tool calls and intermediate steps as JSONL for debugging |

### Log Format

Each feature produces three log files:

| File | Format | Purpose |
|------|--------|---------|
| `logs/build-F001-XXX.log` | Human-readable | Tool calls (`[READ]`, `[EDIT]`, `[BASH]`), text output, result summary |
| `logs/build-F001-XXX.jsonl` | Raw JSONL | Every streaming event from the session — for debugging failures |
| `logs/build-F001-XXX.log.stderr` | Text | Stderr from the Claude CLI itself (errors, warnings) |

The JSONL is parsed by `scripts/parse-build-stream.py` into the readable `.log` file. The parser extracts tool names, file paths, bash commands, and the final cost/duration/turn count.

### Flags NOT Used (Validated as Non-existent)

| Flag from Design Doc | Reality |
|---|---|
| `--max-turns <n>` | Does not exist — rely on natural workflow termination |
| `--append-system-prompt-file` | Does not exist — prompt tells Claude to read the file instead |

### Mock Data Enforcement

The `phase-gate.sh` hook enforces mock data lifecycle:
- **Phase 2**: Must CREATE mock data (visual validation)
- **Phase 4**: Must REMOVE mock data (replace with real backend wiring)

The hook checks `app/`, `components/`, and `lib/` directories for mock data patterns (`mockData`, `MOCK_`, `sampleData`, `demoData`). This prevents features from shipping with placeholder data instead of real backend integration.

### Auto-Decision Mode

In normal `/build`, Phases 1-3 are "decision gates" requiring human approval. In batch mode, the prompt explicitly tells Claude to auto-decide from PRD content: "All decision gates are auto-decided from PRD. Do NOT wait for user confirmation."

---

## Architecture

```
scripts/build-batch.sh          # Main orchestrator (bash)
scripts/parse-build-stream.py   # Stream-JSON → human-readable log parser
logs/build-F001-XXX.log         # Human-readable per-feature log
logs/build-F001-XXX.jsonl       # Raw stream-json per-feature log (for debugging)
logs/build-F001-XXX.log.stderr  # Stderr from Claude CLI
progress.md                     # Current session state (Vibe System)
feature_list.json               # Feature completion tracking
.claude/hooks/phase-gate.sh     # Quality gate enforcement (Stop hook)
.claude/commands/build-auto.md  # 5-phase workflow definition
docs/prds/F001-*.md             # PRD with feature markers
```

---

## Alternatives Considered

| Approach | Why Rejected |
|----------|-------------|
| Claude Agent SDK | Requires API key (separate billing), more complex |
| Agent Teams | Overkill for sequential builds |
| Single long session | Context compaction destroys quality after ~3 features |
| Ralph Wiggum plugin | Stop hook loops — harder to control per-feature |

---

## Troubleshooting

### Feature fails at Phase 4 (build)
Check the log: `cat logs/build-F001-XXX.log | grep -A5 "FAIL"`. Usually a test failure or build error. Fix the issue, then re-run the script (it skips completed features).

### Mock data not removed
The phase-gate.sh hook checks for `mockData`, `MOCK_`, `sampleData`, `demoData` patterns in `app/`, `components/`, `lib/`. If mock data persists, the gate fails and Claude retries up to 3 times before escalating.

### Session runs too long
No `--max-turns` flag exists. If a session appears stuck, check the log. The phase-gate.sh circuit breaker escalates after 3 failed gate attempts. You can also `Ctrl+C` the script and re-run — completed features are skipped.

### `sed` errors on macOS
The phase-gate.sh uses `sed -i ''` (macOS-compatible). If you see "unterminated substitute" errors, ensure the fix has been applied.
