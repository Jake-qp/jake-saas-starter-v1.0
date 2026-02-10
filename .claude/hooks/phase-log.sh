#!/bin/bash
# Claude Code V8.1 - Phase Logging Hook

FILE="$1"
mkdir -p .claude/state

# Log file writes for phase tracking
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "$TIMESTAMP: $FILE" >> .claude/state/file-log.txt

exit 0
