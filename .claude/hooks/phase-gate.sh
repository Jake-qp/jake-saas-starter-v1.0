#!/bin/bash
# Vibe System V10 - Phase Gate Hook
# Backward compatible with V9 (feature_list.json) and V10 (IMPLEMENTATION_PLAN.md)
#
# This hook runs at the end of each Claude turn (Stop event).
# It enforces verification gates by returning exit code 2 if checks fail,
# which forces Claude to continue and fix the issues.

set -o pipefail

# Create state directory if needed
mkdir -p .claude/state

# Check if we're in a build context (progress.md exists)
if [ ! -f "progress.md" ]; then
    exit 0  # Not in a build, nothing to verify
fi

# Read current phase and gate status from progress.md
CURRENT_PHASE=$(grep -oP '(?<=\*\*Phase:\*\* )\d+' progress.md 2>/dev/null | head -1 || echo "0")
GATE_STATUS=$(grep -oP '(?<=\*\*Gate Status:\*\* )\w+' progress.md 2>/dev/null | head -1 || echo "none")
ATTEMPT=$(grep -oP '(?<=\*\*Gate Attempt:\*\* )\d+' progress.md 2>/dev/null | head -1 || echo "1")

# Log for debugging
echo "[phase-gate] Phase: $CURRENT_PHASE, Gate: $GATE_STATUS, Attempt: $ATTEMPT" >> .claude/state/gate-log.txt

# Only run verification if gate is pending
if [ "$GATE_STATUS" != "pending" ]; then
    exit 0  # No gate pending, allow stop
fi

# Circuit breaker - max 3 attempts
if [ "$ATTEMPT" -ge 3 ]; then
    echo "⚠️ ESCALATION REQUIRED" >&2
    echo "" >&2
    echo "Phase $CURRENT_PHASE verification gate failed 3 times." >&2
    echo "Please review the errors above and provide guidance." >&2
    echo "" >&2
    echo "Options:" >&2
    echo "- 🔧 Help fix the specific issue" >&2
    echo "- ⏭️ Override with: 'Set gate status to passed'" >&2
    echo "- 🔄 Start fresh with: 'Reset gate attempt'" >&2

    # Update progress.md to show escalation
    sed -i '' 's/\*\*Gate Status:\*\* pending/\*\*Gate Status:\*\* ESCALATED/' progress.md 2>/dev/null
    exit 0  # Let Claude stop to show escalation
fi

# Detect tracking system (V10 or V9)
TRACKING_SYSTEM="none"
if [ -f "IMPLEMENTATION_PLAN.md" ]; then
    TRACKING_SYSTEM="V10"
elif [ -f "feature_list.json" ]; then
    TRACKING_SYSTEM="V9"
fi

# Run phase-specific verification
ERRORS=""

case $CURRENT_PHASE in
    2)
        # Phase 2: Mock data must exist in app/, components/, or lib/
        MOCK_COUNT=0
        for dir in app/ components/ lib/; do
            if [ -d "$dir" ]; then
                DIR_COUNT=$(grep -rl "mockData\|MOCK_\|sampleData\|demoData" "$dir" 2>/dev/null | wc -l)
                MOCK_COUNT=$((MOCK_COUNT + DIR_COUNT))
            fi
        done
        if [ "$MOCK_COUNT" -eq 0 ]; then
            ERRORS="${ERRORS}Phase 2 requires mock data for visual validation.\n"
            ERRORS="${ERRORS}Create realistic sample data (e.g., const mockData = [...]) in app/, components/, or lib/.\n"
        fi
        ;;

    4)
        # Phase 4: TDD + no mock data + tests pass + build succeeds

        # Check: Mock data removed from app/, components/, lib/
        MOCK_FILES=""
        for dir in app/ components/ lib/; do
            if [ -d "$dir" ]; then
                DIR_HITS=$(grep -rl "mockData\|MOCK_\|sampleData\|demoData" "$dir" 2>/dev/null | grep -v ".test." | grep -v "__test__" | grep -v "__tests__" || true)
                if [ -n "$DIR_HITS" ]; then
                    MOCK_FILES="${MOCK_FILES}${DIR_HITS}\n"
                fi
            fi
        done
        if [ -n "$MOCK_FILES" ]; then
            MOCK_COUNT=$(echo -e "$MOCK_FILES" | grep -c . || true)
            ERRORS="${ERRORS}Mock data still present in ${MOCK_COUNT} file(s):\n"
            ERRORS="${ERRORS}${MOCK_FILES}\n"
            ERRORS="${ERRORS}Replace ALL mock data with real backend-wired data. Every component must use real Convex queries/mutations.\n"
        fi

        # Check: Tests pass
        if [ -f "package.json" ]; then
            if ! npm test 2>&1 > .claude/state/test-output.txt; then
                ERRORS="${ERRORS}Tests are failing. See output above.\n"
            fi
        fi

        # Check: Lint passes (compilation + ESLint)
        # Note: Full `npm run build` depends on runtime env vars (e.g., Clerk keys)
        # and may fail in CI-less environments. Lint catches code quality issues.
        if [ -f "package.json" ] && grep -q '"lint"' package.json; then
            if ! npx next lint 2>&1 > .claude/state/lint-output.txt; then
                ERRORS="${ERRORS}Lint is failing. See output above.\n"
            fi
        fi
        ;;

    5)
        # Phase 5: Documentation complete + Security audit

        # Check: CHANGELOG.md updated (if it exists)
        if [ -f "CHANGELOG.md" ]; then
            if ! grep -A5 "\[Unreleased\]" CHANGELOG.md | grep -qE "^### |^- "; then
                ERRORS="${ERRORS}CHANGELOG.md has no entries under [Unreleased].\n"
                ERRORS="${ERRORS}Add an entry describing this feature.\n"
            fi
        fi

        # Check: Feature tracking updated based on system version
        if [ "$TRACKING_SYSTEM" = "V10" ]; then
            # V10: Check IMPLEMENTATION_PLAN.md
            CURRENT_FEATURE=$(grep "## Current Feature:" IMPLEMENTATION_PLAN.md 2>/dev/null | sed 's/## Current Feature: //' | head -1)
            if [ -n "$CURRENT_FEATURE" ]; then
                # Check if feature is marked complete in project status table
                if ! grep -q "| ${CURRENT_FEATURE}.*| complete |" IMPLEMENTATION_PLAN.md 2>/dev/null; then
                    ERRORS="${ERRORS}IMPLEMENTATION_PLAN.md not updated.\n"
                    ERRORS="${ERRORS}Update Project Status table: set ${CURRENT_FEATURE} to 'complete'.\n"
                fi
            fi
        elif [ "$TRACKING_SYSTEM" = "V9" ]; then
            # V9 Legacy: Check feature_list.json
            CURRENT_FEATURE=$(grep -oP '(?<="id": ")[^"]+' progress.md 2>/dev/null | head -1)
            if [ -n "$CURRENT_FEATURE" ]; then
                if ! grep -A2 "\"id\": \"$CURRENT_FEATURE\"" feature_list.json | grep -q '"status": "complete"'; then
                    ERRORS="${ERRORS}feature_list.json not updated.\n"
                    ERRORS="${ERRORS}Set status to 'complete' for $CURRENT_FEATURE.\n"
                fi
            fi
        fi

        # Check: Tests still pass
        if [ -f "package.json" ]; then
            if ! npm test 2>&1 > .claude/state/test-output.txt; then
                ERRORS="${ERRORS}Tests are failing. Fix before completing.\n"
            fi
        fi

        # Check: Lint still passes
        if [ -f "package.json" ] && grep -q '"lint"' package.json; then
            if ! npx next lint 2>&1 > .claude/state/lint-output.txt; then
                ERRORS="${ERRORS}Lint is failing. Fix before completing.\n"
            fi
        fi

        # Check: Security audit - no hardcoded secrets in app/, components/, lib/, convex/
        SECRET_HITS=""
        for dir in app/ components/ lib/ convex/; do
            if [ -d "$dir" ]; then
                DIR_SECRETS=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
                    -E "(sk_live_|pk_live_|AKIA[A-Z0-9]{16}|ghp_[a-zA-Z0-9]{36}|password\s*=\s*['\"][^'\"]+['\"])" \
                    "$dir" 2>/dev/null | grep -v "\.test\." | grep -v "__test__" | grep -v "__tests__" | head -5 || true)
                if [ -n "$DIR_SECRETS" ]; then
                    SECRET_HITS="${SECRET_HITS}${DIR_SECRETS}\n"
                fi
            fi
        done
        if [ -n "$SECRET_HITS" ]; then
            ERRORS="${ERRORS}SECURITY: Potential hardcoded secrets found:\n"
            ERRORS="${ERRORS}$SECRET_HITS\n"
            ERRORS="${ERRORS}Remove secrets and use environment variables.\n"
        fi
        ;;
esac

# If errors, increment attempt and return exit 2
if [ -n "$ERRORS" ]; then
    NEW_ATTEMPT=$((ATTEMPT + 1))
    sed -i '' "s/\*\*Gate Attempt:\*\* $ATTEMPT/\*\*Gate Attempt:\*\* $NEW_ATTEMPT/" progress.md 2>/dev/null

    echo "❌ Phase $CURRENT_PHASE Verification Gate FAILED (attempt $ATTEMPT/3)" >&2
    echo "" >&2
    echo -e "$ERRORS" >&2
    echo "" >&2
    echo "Fix these issues and try again." >&2

    exit 2  # Forces Claude to continue
fi

# Gate passed - update status
sed -i '' 's/\*\*Gate Status:\*\* pending/\*\*Gate Status:\*\* PASSED/' progress.md 2>/dev/null
sed -i '' 's/\*\*Gate Attempt:\*\* [0-9]/\*\*Gate Attempt:\*\* 1/' progress.md 2>/dev/null

echo "✅ Phase $CURRENT_PHASE Verification Gate PASSED" >> .claude/state/gate-log.txt
exit 0
