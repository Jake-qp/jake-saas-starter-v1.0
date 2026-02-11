#!/bin/bash
# Vibe System V10 - Checkpoint Hook (Stop)
#
# Captures session state on Stop events. Maintains a running scratchpad
# with git state, feature context, and modified files.
# Creates SCRATCHPAD.md if missing — enables recovery for both interactive
# and batch builds.

mkdir -p .claude/state

# Create SCRATCHPAD.md if it doesn't exist
if [ ! -f "SCRATCHPAD.md" ]; then
    echo "# Scratchpad" > SCRATCHPAD.md
    echo "" >> SCRATCHPAD.md
    echo "Session state captured by hooks. Read this to restore context after compaction or failed builds." >> SCRATCHPAD.md
fi

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "" >> SCRATCHPAD.md
echo "---" >> SCRATCHPAD.md
echo "**Checkpoint:** $TIMESTAMP" >> SCRATCHPAD.md

if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "none")
    echo "- Branch: $BRANCH" >> SCRATCHPAD.md
    echo "- Last commit: $COMMIT" >> SCRATCHPAD.md

    # Modified/untracked files
    DIRTY=$(git status --porcelain 2>/dev/null)
    if [ -n "$DIRTY" ]; then
        echo "- Dirty files:" >> SCRATCHPAD.md
        echo "$DIRTY" | while IFS= read -r line; do
            echo "  - \`$line\`" >> SCRATCHPAD.md
        done
    fi

    # Last 3 commit messages
    echo "- Recent commits:" >> SCRATCHPAD.md
    git log --oneline -3 2>/dev/null | while IFS= read -r line; do
        echo "  - $line" >> SCRATCHPAD.md
    done
fi

# Feature/phase from progress.md
if [ -f "progress.md" ]; then
    FEATURE_ID=$(grep '^\*\*ID:\*\*' progress.md 2>/dev/null | head -1 | sed 's/\*\*ID:\*\* //')
    PHASE=$(grep '^\*\*Phase:\*\*' progress.md 2>/dev/null | head -1 | sed 's/\*\*Phase:\*\* //')
    [ -n "$FEATURE_ID" ] && echo "- Feature: $FEATURE_ID" >> SCRATCHPAD.md
    [ -n "$PHASE" ] && echo "- Phase: $PHASE" >> SCRATCHPAD.md
fi

# NOTE: Auto-commit removed in V8.7 - see design decision in README.md
# Semantic commits (spec:, design:, arch:, feat:, verify:) are created
# by build.md at each phase checkpoint after user approval.

exit 0
