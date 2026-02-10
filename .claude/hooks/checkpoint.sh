#!/bin/bash
# Vibe System V8.7 - Checkpoint Hook
# 
# V8.7 FIX: Removed auto-commit logic that was defeating semantic commits
# (spec:, design:, arch:, feat:, verify:). Commits are now handled 
# explicitly in build.md after user approval at each phase checkpoint.

mkdir -p .claude/state

if [ -f "SCRATCHPAD.md" ]; then
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    echo "" >> SCRATCHPAD.md
    echo "---" >> SCRATCHPAD.md
    echo "**Checkpoint:** $TIMESTAMP" >> SCRATCHPAD.md
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        BRANCH=$(git branch --show-current 2>/dev/null)
        COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "none")
        echo "- Branch: $BRANCH" >> SCRATCHPAD.md
        echo "- Last commit: $COMMIT" >> SCRATCHPAD.md
    fi
fi

# NOTE: Auto-commit removed in V8.7 - see design decision in README.md
# Semantic commits (spec:, design:, arch:, feat:, verify:) are created
# by build.md at each phase checkpoint after user approval.

exit 0
