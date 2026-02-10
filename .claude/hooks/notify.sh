#!/bin/bash
# Vibe System V8.8 - Notification Hook

# Skip in cloud/remote environments
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
    exit 0
fi

TITLE="$1"
MESSAGE="$2"

if command -v osascript &> /dev/null; then
    osascript -e "display notification \"$MESSAGE\" with title \"Claude Code: $TITLE\"" 2>/dev/null
fi

if command -v notify-send &> /dev/null; then
    notify-send "Claude Code: $TITLE" "$MESSAGE" 2>/dev/null
fi

exit 0
