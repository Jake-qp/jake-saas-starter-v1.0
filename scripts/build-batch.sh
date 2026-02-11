#!/bin/bash
# Build Batch Orchestrator
# Builds all PRD features by spawning a fresh claude -p session per feature.
# Each session gets a clean context window, follows the 5-phase build workflow,
# and commits per phase. See docs/build-batch-orchestrator.md for full docs.
#
# Usage:
#   scripts/build-batch.sh --prd F001              # Build all features for a PRD
#   scripts/build-batch.sh --feature F001-016      # Build single feature (auto-detects PRD)
#   scripts/build-batch.sh --prd F001 --feature F001-016  # Explicit PRD + feature
#   CLAUDE_MODEL=sonnet scripts/build-batch.sh --prd F001 # Override model

set -euo pipefail

# Configuration
MODEL="${CLAUDE_MODEL:-opus}"
LOG_DIR="logs"

# Track results
PASSED=()
FAILED=()
SKIPPED=()

# Parse arguments
SINGLE_FEATURE=""
PRD_ID=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --feature)
            SINGLE_FEATURE="$2"
            shift 2
            ;;
        --prd)
            PRD_ID="$2"
            shift 2
            ;;
        *)
            echo "Unknown argument: $1"
            echo "Usage: scripts/build-batch.sh --prd <PRD_ID> [--feature <FEATURE_ID>]"
            echo "       scripts/build-batch.sh --feature <FEATURE_ID>"
            exit 1
            ;;
    esac
done

# Auto-detect PRD from feature ID prefix (e.g., F001-016 → F001)
if [ -z "$PRD_ID" ] && [ -n "$SINGLE_FEATURE" ]; then
    PRD_ID=$(echo "$SINGLE_FEATURE" | grep -oE '^F[0-9]+')
    if [ -z "$PRD_ID" ]; then
        echo "ERROR: Could not auto-detect PRD from feature ID: $SINGLE_FEATURE"
        echo "Use --prd <PRD_ID> to specify explicitly."
        exit 1
    fi
    echo "Auto-detected PRD: ${PRD_ID}"
fi

# Require --prd in full-batch mode
if [ -z "$PRD_ID" ] && [ -z "$SINGLE_FEATURE" ]; then
    echo "ERROR: --prd <PRD_ID> is required in full-batch mode."
    echo "Usage: scripts/build-batch.sh --prd <PRD_ID>"
    echo "       scripts/build-batch.sh --feature <FEATURE_ID>"
    exit 1
fi

# Resolve PRD file from feature_list.json
resolve_prd_file() {
    local prd_id="$1"
    python3 -c "
import json, sys
try:
    with open('feature_list.json') as f:
        data = json.load(f)
    for feat in data.get('features', []):
        if feat.get('id', '').startswith('${prd_id}-') and feat.get('prd'):
            print(feat['prd'])
            sys.exit(0)
    print('ERROR: No features found for PRD ${prd_id} in feature_list.json', file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
" 2>&1
}

PRD_FILE=$(resolve_prd_file "$PRD_ID")
if [[ "$PRD_FILE" == ERROR:* ]]; then
    echo "$PRD_FILE"
    exit 1
fi
echo "PRD file: ${PRD_FILE}"

# Build batch arrays dynamically from feature_list.json
# Returns a JSON object like {"1": ["F001-001", "F001-014"], "2": [...], ...}
get_batches() {
    local prd_id="$1"
    python3 -c "
import json, sys
try:
    with open('feature_list.json') as f:
        data = json.load(f)
    batches = {}
    for feat in data.get('features', []):
        if feat.get('id', '').startswith('${prd_id}-'):
            batch_num = str(feat.get('batch', 0))
            if batch_num not in batches:
                batches[batch_num] = []
            batches[batch_num].append(feat['id'])
    # Output sorted by batch number, one batch per line: batch_num:id1,id2,...
    for batch_num in sorted(batches.keys(), key=int):
        print(f'{batch_num}:{\",\".join(batches[batch_num])}')
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
"
}

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
        --verbose \
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

# ────────────────────────────────────────────────────
# Single feature mode
# ────────────────────────────────────────────────────
if [ -n "$SINGLE_FEATURE" ]; then
    echo "========================================"
    echo "  Batch Builder — Single Feature"
    echo "  PRD:     ${PRD_ID}"
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

# Read batches dynamically from feature_list.json
BATCH_DATA=$(get_batches "$PRD_ID")
BATCH_COUNT=$(echo "$BATCH_DATA" | wc -l | tr -d ' ')

echo "========================================"
echo "  Batch Builder — Full PRD"
echo "  PRD:     ${PRD_ID}"
echo "  PRD File: ${PRD_FILE}"
echo "  Model:   ${MODEL}"
echo "  Batches: ${BATCH_COUNT}"
echo "  Mode:    Fresh context per feature"
echo "========================================"
echo ""
echo "Starting at: $(date)"
START_TIME=$(date +%s)

# Run all batches in order
BATCH_INDEX=0
while IFS= read -r BATCH_LINE; do
    BATCH_INDEX=$((BATCH_INDEX + 1))
    BATCH_NUM="${BATCH_LINE%%:*}"
    BATCH_FEATURES_STR="${BATCH_LINE#*:}"

    # Split comma-separated feature IDs into array
    IFS=',' read -ra BATCH_FEATURES <<< "$BATCH_FEATURES_STR"

    echo ""
    echo "########################################"
    echo "  BATCH ${BATCH_NUM} (${BATCH_INDEX}/${BATCH_COUNT})"
    echo "  Features: ${BATCH_FEATURES[*]}"
    echo "########################################"

    for FEATURE_ID in "${BATCH_FEATURES[@]}"; do
        build_feature "$FEATURE_ID"
    done

    # After each batch, check if total failures increased
    if [ ${#FAILED[@]} -gt 0 ]; then
        echo ""
        echo "WARNING: Feature(s) failed in batch ${BATCH_NUM}."
        echo "Failed so far: ${FAILED[*]}"
        echo ""
        read -p "Continue to next batch? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Stopping batch build."
            break
        fi
    fi
done <<< "$BATCH_DATA"

# Summary
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
HOURS=$((DURATION / 3600))
MINUTES=$(( (DURATION % 3600) / 60 ))

echo ""
echo "========================================"
echo "  BUILD COMPLETE"
echo "========================================"
echo "  PRD:     ${PRD_ID}"
echo "  Duration: ${HOURS}h ${MINUTES}m"
echo "  Passed:  ${#PASSED[@]} — ${PASSED[*]:-none}"
echo "  Failed:  ${#FAILED[@]} — ${FAILED[*]:-none}"
echo "  Skipped: ${#SKIPPED[@]} — ${SKIPPED[*]:-none}"
echo ""
echo "  Logs: ${LOG_DIR}/"
echo "  Next: git log --oneline -50"
echo "========================================"
