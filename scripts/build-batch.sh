#!/bin/bash
# Build Batch Orchestrator
# Builds all PRD features by spawning a fresh claude -p session per feature.
# Each session gets a clean context window, follows the 5-phase build workflow,
# and commits per phase. See docs/build-batch-orchestrator.md for full docs.
#
# Usage:
#   scripts/build-batch.sh                    # Build all features
#   scripts/build-batch.sh --feature F001-016 # Build single feature
#   CLAUDE_MODEL=sonnet scripts/build-batch.sh # Override model

set -euo pipefail

# Configuration
PRD_ID="F001"
PRD_FILE="docs/prds/F001-saas-boilerplate-v2.md"
MODEL="${CLAUDE_MODEL:-opus}"
LOG_DIR="logs"

# Batches in dependency order (F001-002 is complete — not included)
BATCH_1=("F001-001" "F001-014" "F001-016")
BATCH_2=("F001-003" "F001-009" "F001-012" "F001-017")
BATCH_3=("F001-004")
BATCH_4=("F001-005" "F001-006" "F001-007" "F001-008" "F001-011" "F001-013")
BATCH_5=("F001-010" "F001-015")

ALL_BATCHES=("BATCH_1" "BATCH_2" "BATCH_3" "BATCH_4" "BATCH_5")

# Track results
PASSED=()
FAILED=()
SKIPPED=()

# Parse arguments
SINGLE_FEATURE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --feature)
            SINGLE_FEATURE="$2"
            shift 2
            ;;
        *)
            echo "Unknown argument: $1"
            echo "Usage: scripts/build-batch.sh [--feature F001-XXX]"
            exit 1
            ;;
    esac
done

# Create log directory
mkdir -p "$LOG_DIR"

# Check if feature is already complete in feature_list.json
is_complete() {
    local feature_id="$1"
    python3 -c "
import json, sys
try:
    with open('feature_list.json') as f:
        data = json.load(f)
    for feat in data.get('features', []):
        if feat.get('id') == '$feature_id' and feat.get('status') == 'complete':
            sys.exit(0)
    sys.exit(1)
except Exception:
    sys.exit(1)
" 2>/dev/null
}

# Build a single feature
build_feature() {
    local FEATURE_ID="$1"
    local LOG_FILE="${LOG_DIR}/build-${FEATURE_ID}.log"

    # Skip if already complete
    if is_complete "$FEATURE_ID"; then
        echo "  [SKIP] ${FEATURE_ID} — already complete"
        SKIPPED+=("$FEATURE_ID")
        return 0
    fi

    echo ""
    echo "============================================"
    echo "  Building: ${FEATURE_ID}"
    echo "  Model:    ${MODEL}"
    echo "  Log:      ${LOG_FILE}"
    echo "  Started:  $(date '+%H:%M:%S')"
    echo "============================================"

    local PROMPT
    read -r -d '' PROMPT <<PROMPT_EOF || true
You are building feature ${FEATURE_ID} from the PRD at ${PRD_FILE}.

FIRST: Read .claude/commands/build-auto.md to understand the 5-phase autonomous workflow.
THEN: Read .claude/commands/build.md for the detailed phase process.

Execute the full build-auto workflow for feature ${FEATURE_ID}:

1. EXTRACT the feature section from the PRD:
   sed -n '/<!-- START_FEATURE: ${FEATURE_ID} -->/,/<!-- END_FEATURE: ${FEATURE_ID} -->/p' ${PRD_FILE}

2. Execute Phases 1-3 (Spec, Design, Data Model):
   - AUTO-DECIDE all decision gates from PRD content
   - Do NOT wait for user confirmation — there is no user in this session
   - Load skills at each phase as specified in build.md (cat .claude/skills/xxx/SKILL.md)

3. Execute Phases 4-5 (Build, Verify):
   - AUTO-VERIFY via phase-gate.sh hook
   - Phase 4: Write tests FIRST (TDD), then implement to pass
   - Phase 4: REMOVE ALL mock data — wire everything to real Convex backend
   - Phase 5: Verify all PRD acceptance criteria are met

4. Commit after each phase with prefix: spec:, design:, arch:, feat:, verify:
5. Update progress.md and feature_list.json on completion

PRD ID: ${PRD_ID}
Feature ID: ${FEATURE_ID}

CRITICAL RULES:
- DO NOT invent features not in the PRD
- DO NOT expand scope beyond PRD acceptance criteria
- DO NOT skip any PRD acceptance criteria
- All decision gates (Phases 1-3) are auto-decided from PRD content. Do NOT wait for user confirmation.
- If ambiguous, make a reasonable decision and document in the commit message
- If partial work exists from a previous session, continue from where it left off

MOCK DATA RULES (ENFORCED BY HOOK):
- Phase 2: CREATE mock data for visual validation
- Phase 4: REMOVE ALL mock data — every component must use real Convex queries/mutations
- The phase-gate.sh hook will FAIL your build if mock data remains in app/, components/, or lib/
- Search for mockData, MOCK_, sampleData, demoData patterns and replace ALL of them
- Do NOT leave any hardcoded sample data in non-test files
PROMPT_EOF

    local START_SECS
    START_SECS=$(date +%s)

    local JSONL_FILE="${LOG_DIR}/build-${FEATURE_ID}.jsonl"

    # Stream JSON captures all tool calls and intermediate steps.
    # The parser extracts a human-readable log; raw JSONL is kept for debugging.
    if claude -p "$PROMPT" \
        --dangerously-skip-permissions \
        --model "$MODEL" \
        --no-session-persistence \
        --output-format stream-json \
        2>"${LOG_FILE}.stderr" | tee "$JSONL_FILE" | \
        python3 scripts/parse-build-stream.py 2>&1 | tee "$LOG_FILE"; then
        local CLAUDE_EXIT=${PIPESTATUS[0]}
        local END_SECS
        END_SECS=$(date +%s)
        local DURATION_MINS=$(( (END_SECS - START_SECS) / 60 ))
        if [ "${CLAUDE_EXIT:-0}" -ne 0 ]; then
            echo "  [FAIL] ${FEATURE_ID} (${DURATION_MINS}min) — see ${LOG_FILE}"
            FAILED+=("$FEATURE_ID")
        else
            echo "  [PASS] ${FEATURE_ID} (${DURATION_MINS}min)"
            PASSED+=("$FEATURE_ID")
        fi
    else
        local END_SECS
        END_SECS=$(date +%s)
        local DURATION_MINS=$(( (END_SECS - START_SECS) / 60 ))
        echo "  [FAIL] ${FEATURE_ID} (${DURATION_MINS}min) — see ${LOG_FILE}"
        FAILED+=("$FEATURE_ID")
    fi
}

# Run a batch of features
run_batch() {
    local BATCH_NAME="$1"
    local -n FEATURES="$1"

    echo ""
    echo "########################################"
    echo "  ${BATCH_NAME}"
    echo "  Features: ${FEATURES[*]}"
    echo "########################################"

    for FEATURE_ID in "${FEATURES[@]}"; do
        build_feature "$FEATURE_ID"
    done
}

# ────────────────────────────────────────────────────
# Single feature mode
# ────────────────────────────────────────────────────
if [ -n "$SINGLE_FEATURE" ]; then
    echo "========================================"
    echo "  SaaS Starter V2 — Single Feature Build"
    echo "  Feature: ${SINGLE_FEATURE}"
    echo "  Model:   ${MODEL}"
    echo "========================================"
    echo ""
    echo "Starting at: $(date)"

    build_feature "$SINGLE_FEATURE"

    echo ""
    echo "========================================"
    if [ ${#PASSED[@]} -gt 0 ]; then
        echo "  RESULT: PASS"
    elif [ ${#SKIPPED[@]} -gt 0 ]; then
        echo "  RESULT: SKIPPED (already complete)"
    else
        echo "  RESULT: FAIL — see logs/build-${SINGLE_FEATURE}.log"
    fi
    echo "========================================"
    exit 0
fi

# ────────────────────────────────────────────────────
# Full batch mode
# ────────────────────────────────────────────────────
echo "========================================"
echo "  SaaS Starter V2 — Batch Builder"
echo "  PRD: ${PRD_ID}"
echo "  Model: ${MODEL}"
echo "  Batches: 5"
echo "  Mode: Fresh context per feature"
echo "========================================"
echo ""
echo "Starting at: $(date)"
START_TIME=$(date +%s)

# Run all batches in order
for BATCH in "${ALL_BATCHES[@]}"; do
    run_batch "$BATCH"

    # After each batch, check if total failures increased
    if [ ${#FAILED[@]} -gt 0 ]; then
        echo ""
        echo "WARNING: Feature(s) failed in ${BATCH}."
        echo "Failed so far: ${FAILED[*]}"
        echo ""
        read -p "Continue to next batch? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Stopping batch build."
            break
        fi
    fi
done

# Summary
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
HOURS=$((DURATION / 3600))
MINUTES=$(( (DURATION % 3600) / 60 ))

echo ""
echo "========================================"
echo "  BUILD COMPLETE"
echo "========================================"
echo "  Duration: ${HOURS}h ${MINUTES}m"
echo "  Passed:  ${#PASSED[@]} — ${PASSED[*]:-none}"
echo "  Failed:  ${#FAILED[@]} — ${FAILED[*]:-none}"
echo "  Skipped: ${#SKIPPED[@]} — ${SKIPPED[*]:-none}"
echo ""
echo "  Logs: ${LOG_DIR}/"
echo "  Next: git log --oneline -50"
echo "========================================"
