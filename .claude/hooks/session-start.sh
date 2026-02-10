#!/bin/bash
# Vibe System V10 - Session Start Hook
# Backward compatible with V9 (feature_list.json) and V10 (IMPLEMENTATION_PLAN.md)

echo "┌─────────────────────────────────────────┐"
echo "│         Vibe System V10 Ready           │"
echo "└─────────────────────────────────────────┘"
echo ""

# Show project name if CLAUDE.md exists
if [ -f "CLAUDE.md" ]; then
    PROJECT=$(grep -m1 "^# " CLAUDE.md | sed 's/^# //' | sed 's/^Project: //')
    if [ -n "$PROJECT" ]; then
        echo "📁 Project: $PROJECT"
    fi
fi

# Show current git branch
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    echo "🌿 Branch: $BRANCH"

    LAST_COMMIT=$(git log -1 --pretty=format:"%s" 2>/dev/null)
    echo "📝 Last commit: $LAST_COMMIT"

    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo "⚠️  Uncommitted changes detected"
    fi
fi

# Feature tracking - V10 (IMPLEMENTATION_PLAN.md) or V9 (feature_list.json)
COMPLETE=0
IN_PROGRESS=0
PENDING=0
PHASE=""
TRACKING_SOURCE=""

if [ -f "IMPLEMENTATION_PLAN.md" ]; then
    # V10: Parse markdown table
    TRACKING_SOURCE="V10"
    COMPLETE=$(grep -c "| complete |" IMPLEMENTATION_PLAN.md 2>/dev/null | tr -d '\n' || echo "0")
    IN_PROGRESS=$(grep -c "| in_progress |" IMPLEMENTATION_PLAN.md 2>/dev/null | tr -d '\n' || echo "0")
    PENDING=$(grep -c "| pending |" IMPLEMENTATION_PLAN.md 2>/dev/null | tr -d '\n' || echo "0")

    # Get current phase from Current Feature section
    PHASE=$(grep "^\*\*Phase:\*\*" IMPLEMENTATION_PLAN.md 2>/dev/null | grep -oP "\d+" | head -1)

elif [ -f "feature_list.json" ]; then
    # V9 Legacy: Parse JSON
    TRACKING_SOURCE="V9"
    COMPLETE=$(grep -c '"status": "complete"' feature_list.json 2>/dev/null | tr -d '\n' || echo "0")
    IN_PROGRESS=$(grep -c '"status": "in_progress"' feature_list.json 2>/dev/null | tr -d '\n' || echo "0")
    PENDING=$(grep -c '"status": "pending"' feature_list.json 2>/dev/null | tr -d '\n' || echo "0")

    # Get current phase from JSON
    PHASE=$(cat feature_list.json 2>/dev/null | grep -A10 '"status": "in_progress"' | grep 'current_phase' | grep -o '[0-9]*' | head -1)
fi

# Ensure we have valid integers
COMPLETE=${COMPLETE:-0}
IN_PROGRESS=${IN_PROGRESS:-0}
PENDING=${PENDING:-0}

# Display feature counts if we have tracking
if [ -n "$TRACKING_SOURCE" ]; then
    echo ""
    echo "📊 Features: $COMPLETE ✅ | $IN_PROGRESS 🔄 | $PENDING ⏳"

    # Resume prompt if in-progress
    if [ "$IN_PROGRESS" -gt 0 ] 2>/dev/null; then
        echo ""
        echo "┌─────────────────────────────────────────┐"
        echo "│  🔄 IN-PROGRESS BUILD DETECTED          │"
        echo "│                                         │"
        echo "│  Run /status for details                │"
        echo "│  Or continue your build                 │"
        echo "└─────────────────────────────────────────┘"

        # Show which skills to load for current phase
        if [ -n "$PHASE" ]; then
            echo ""
            case $PHASE in
                1) echo "📚 Phase 1: cat .claude/skills/INDEX.md (then load spec)" ;;
                2) echo "📚 Phase 2: cat .claude/skills/INDEX.md (then load ux, ui)" ;;
                3) echo "📚 Phase 3: cat .claude/skills/INDEX.md (then load database, architecture)" ;;
                4) echo "📚 Phase 4: cat .claude/skills/INDEX.md (then load tdd)" ;;
                5) echo "📚 Phase 5: cat .claude/skills/INDEX.md (then load verification)" ;;
            esac
        fi
    fi
fi

# Progress notes
if [ -f "progress.md" ]; then
    echo ""
    echo "📋 Session notes: progress.md"
fi

# Show pending tasks
if [ -f ".tasks" ]; then
    TASK_PENDING=$(grep -c "^\[ \]" .tasks 2>/dev/null | tr -d '\n' || echo "0")
    TASK_PENDING=${TASK_PENDING:-0}
    if [ "$TASK_PENDING" != "0" ]; then
        echo "📝 Pending tasks: $TASK_PENDING"
    fi
fi

# Check for the pin
if [ -f "specs/readme.md" ]; then
    echo "📍 Project index: specs/readme.md"
fi

# Migration hint for V9 projects
if [ "$TRACKING_SOURCE" = "V9" ] && [ ! -f "IMPLEMENTATION_PLAN.md" ]; then
    echo ""
    echo "💡 Tip: Run /migrate to upgrade to V10 state management"
fi

echo ""
echo "Commands: /build | /quick | /fix | /status | /help"
echo ""
