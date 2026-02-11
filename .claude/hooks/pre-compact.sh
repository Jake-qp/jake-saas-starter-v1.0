#!/bin/bash
# Vibe System V10 - PreCompact Hook
# Saves working state to SCRATCHPAD.md before context compaction.
# Fires on both auto-compact (~95% context) and manual /compact.

SCRATCHPAD="SCRATCHPAD.md"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Create SCRATCHPAD.md if it doesn't exist
if [ ! -f "$SCRATCHPAD" ]; then
    echo "# Scratchpad" > "$SCRATCHPAD"
    echo "" >> "$SCRATCHPAD"
    echo "Session state preserved by PreCompact hook. Read this after compaction to restore context." >> "$SCRATCHPAD"
fi

echo "" >> "$SCRATCHPAD"
echo "---" >> "$SCRATCHPAD"
echo "## Compaction Snapshot — $TIMESTAMP" >> "$SCRATCHPAD"
echo "" >> "$SCRATCHPAD"

# Git state
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "none")
    echo "### Git State" >> "$SCRATCHPAD"
    echo "- **Branch:** $BRANCH" >> "$SCRATCHPAD"
    echo "- **Last commit:** $COMMIT" >> "$SCRATCHPAD"

    # Modified/untracked files
    DIRTY=$(git status --porcelain 2>/dev/null)
    if [ -n "$DIRTY" ]; then
        echo "- **Dirty files:**" >> "$SCRATCHPAD"
        echo '```' >> "$SCRATCHPAD"
        echo "$DIRTY" >> "$SCRATCHPAD"
        echo '```' >> "$SCRATCHPAD"
    else
        echo "- **Working tree:** clean" >> "$SCRATCHPAD"
    fi

    # Recent commits (last 5)
    echo "" >> "$SCRATCHPAD"
    echo "### Recent Commits" >> "$SCRATCHPAD"
    echo '```' >> "$SCRATCHPAD"
    git log --oneline -5 2>/dev/null >> "$SCRATCHPAD"
    echo '```' >> "$SCRATCHPAD"
fi

# Feature/phase from progress.md
if [ -f "progress.md" ]; then
    FEATURE_ID=$(grep '^\*\*ID:\*\*' progress.md 2>/dev/null | head -1 | sed 's/\*\*ID:\*\* //')
    PHASE=$(grep '^\*\*Phase:\*\*' progress.md 2>/dev/null | head -1 | sed 's/\*\*Phase:\*\* //')
    STATUS=$(grep '^\*\*Status:\*\*' progress.md 2>/dev/null | head -1 | sed 's/\*\*Status:\*\* //')

    if [ -n "$FEATURE_ID" ]; then
        echo "" >> "$SCRATCHPAD"
        echo "### Build Context" >> "$SCRATCHPAD"
        echo "- **Feature:** $FEATURE_ID" >> "$SCRATCHPAD"
        [ -n "$PHASE" ] && echo "- **Phase:** $PHASE" >> "$SCRATCHPAD"
        [ -n "$STATUS" ] && echo "- **Status:** $STATUS" >> "$SCRATCHPAD"
    fi
fi

echo "" >> "$SCRATCHPAD"
echo "### Recovery" >> "$SCRATCHPAD"
echo "Read \`SCRATCHPAD.md\`, \`progress.md\`, and recent git log to restore context." >> "$SCRATCHPAD"

exit 0
