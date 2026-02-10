#!/bin/bash
# Claude Code V8.1 - Auto-Format Hook

FILE="$1"
EXTENSION="${FILE##*.}"

[ ! -f "$FILE" ] && exit 0

case "$EXTENSION" in
    js|jsx|ts|tsx|json|css|scss|md|html|yaml|yml)
        if command -v npx &> /dev/null; then
            npx prettier --write "$FILE" 2>/dev/null
        fi
        ;;
    py)
        if command -v black &> /dev/null; then
            black "$FILE" 2>/dev/null
        fi
        ;;
    go)
        if command -v gofmt &> /dev/null; then
            gofmt -w "$FILE" 2>/dev/null
        fi
        ;;
esac

exit 0
