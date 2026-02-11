# Build Batch Orchestrator

> **Purpose:** Build all PRD features autonomously by spawning a fresh Claude Code session per feature.
> **Status:** Validated and ready to run
> **Last Updated:** 2026-02-11

---

## Why This Exists

Building many modules in a single Claude Code session causes context window compaction after ~3 features, degrading output quality. The batch orchestrator solves this by running `claude -p` (print mode) per feature — each gets a fresh context window, reads CLAUDE.md automatically, follows the Vibe System's 5-phase build workflow, and exits when done.

---

## How It Works

```
scripts/build-batch.sh --prd <PRD_ID>
│
├─ Reads feature_list.json to discover features for this PRD
├─ Groups features by "batch" field, sorted by batch number
├─ Resolves PRD file path from each feature's "prd" field
│
├─ For each batch (sequential):
│  └─ For each feature in batch (sequential):
│     │
│     ├─ Check feature_list.json — skip if "complete"
│     ├─ Build prompt with feature ID + PRD reference
│     ├─ Run: claude -p "$PROMPT" --dangerously-skip-permissions --model opus
│     ├─ Log output to logs/build-<FEATURE_ID>.log
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

## Usage

### Build all features for a PRD
```bash
scripts/build-batch.sh --prd F001
```

### Build a single feature (auto-detects PRD from feature ID prefix)
```bash
scripts/build-batch.sh --feature F001-016
```

### Explicit PRD + feature
```bash
scripts/build-batch.sh --prd F001 --feature F001-016
```

### Use a different model
```bash
CLAUDE_MODEL=sonnet scripts/build-batch.sh --prd F001
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
2. Re-run `scripts/build-batch.sh --prd <PRD_ID>` — it picks up where it left off

If a feature failed mid-build (partial commits exist), the next session's prompt tells Claude to continue from where it left off.

---

## Multi-PRD Support

The orchestrator is PRD-generic. It discovers features and batches from `feature_list.json` by matching feature IDs that start with the given PRD prefix (e.g., `--prd F001` matches features `F001-001`, `F001-002`, etc.).

To add a new PRD:
1. Create the PRD document via `/prd`
2. Add features to `feature_list.json` with `"prd"` field pointing to the PRD file
3. Assign `"batch"` numbers based on dependency order
4. Run `scripts/build-batch.sh --prd <NEW_PRD_ID>`

### feature_list.json structure

Each feature entry must include:
```json
{
  "id": "F002-001",
  "name": "Feature Name",
  "type": "frontend|backend",
  "priority": 0,
  "status": "pending",
  "current_phase": 0,
  "batch": 1,
  "dependencies": [],
  "description": "One-line description",
  "prd": "docs/prds/F002-feature-name.md"
}
```

Key fields for the orchestrator:
- `id`: Must start with PRD prefix (e.g., `F002-`)
- `batch`: Determines build order (1 = first, sequential between batches)
- `status`: `"complete"` features are skipped
- `prd`: Path to the PRD file (used in the prompt to Claude)

---

## Prerequisites

Before running, ensure these exist:

| Prerequisite | Purpose | How to verify |
|---|---|---|
| PRD feature markers | `build-auto` extracts per-feature ACs via `sed` | `grep "START_FEATURE" docs/prds/<PRD_FILE>` |
| `feature_list.json` | All features with correct statuses, batch numbers, and `prd` field | `cat feature_list.json \| python3 -m json.tool` |
| `CHANGELOG.md` | Phase 5 gate checks for entries | `cat CHANGELOG.md` |
| `scripts/build-batch.sh` | The orchestrator script | `ls -la scripts/build-batch.sh` |
| `logs/` directory | Per-feature build logs | Created automatically |

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
| `logs/build-<ID>.log` | Human-readable | Tool calls (`[READ]`, `[EDIT]`, `[BASH]`), text output, result summary |
| `logs/build-<ID>.jsonl` | Raw JSONL | Every streaming event from the session — for debugging failures |
| `logs/build-<ID>.log.stderr` | Text | Stderr from the Claude CLI itself (errors, warnings) |

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
scripts/build-batch.sh          # Main orchestrator (bash, PRD-generic)
scripts/parse-build-stream.py   # Stream-JSON → human-readable log parser
logs/build-<ID>.log             # Human-readable per-feature log
logs/build-<ID>.jsonl           # Raw stream-json per-feature log (for debugging)
logs/build-<ID>.log.stderr      # Stderr from Claude CLI
progress.md                     # Current session state (Vibe System)
feature_list.json               # Feature completion tracking (all PRDs)
.claude/hooks/phase-gate.sh     # Quality gate enforcement (Stop hook)
.claude/commands/build-auto.md  # 5-phase workflow definition
docs/prds/*.md                  # PRD files with feature markers
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
Check the log: `cat logs/build-<ID>.log | grep -A5 "FAIL"`. Usually a test failure or build error. Fix the issue, then re-run the script (it skips completed features).

### Mock data not removed
The phase-gate.sh hook checks for `mockData`, `MOCK_`, `sampleData`, `demoData` patterns in `app/`, `components/`, `lib/`. If mock data persists, the gate fails and Claude retries up to 3 times before escalating.

### Session runs too long
No `--max-turns` flag exists. If a session appears stuck, check the log. The phase-gate.sh circuit breaker escalates after 3 failed gate attempts. You can also `Ctrl+C` the script and re-run — completed features are skipped.

### `sed` errors on macOS
The phase-gate.sh uses `sed -i ''` (macOS-compatible). If you see "unterminated substitute" errors, ensure the fix has been applied.
