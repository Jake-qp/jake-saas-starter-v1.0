#!/usr/bin/env python3
"""Parse claude -p --output-format stream-json into a human-readable build log.

Usage:
    claude -p "..." --output-format stream-json | tee build.jsonl | python3 scripts/parse-build-stream.py

Reads JSONL events from stdin, writes readable log lines to stdout.
"""
import sys
import json
from datetime import datetime


def format_tool(name, inp):
    """Format a tool call into a one-line summary."""
    if name == "Read":
        return f"[READ] {inp.get('file_path', '?')}"
    elif name == "Write":
        return f"[WRITE] {inp.get('file_path', '?')}"
    elif name == "Edit":
        path = inp.get("file_path", "?")
        return f"[EDIT] {path}"
    elif name == "Bash":
        desc = inp.get("description", "")
        cmd = inp.get("command", "")
        label = desc or (cmd[:80] + ("..." if len(cmd) > 80 else ""))
        return f"[BASH] {label}"
    elif name == "Glob":
        return f"[GLOB] {inp.get('pattern', '?')}"
    elif name == "Grep":
        return f"[GREP] {inp.get('pattern', '?')}"
    elif name == "Skill":
        return f"[SKILL] {inp.get('skill', '?')}"
    elif name == "TaskCreate":
        return f"[TASK+] {inp.get('subject', '?')}"
    elif name == "TaskUpdate":
        return f"[TASK~] #{inp.get('taskId', '?')} -> {inp.get('status', '?')}"
    else:
        return f"[TOOL] {name}"


def main():
    tool_count = 0
    text_chars = 0

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            # Not JSON - pass through as-is
            print(line, flush=True)
            continue

        etype = event.get("type", "")

        if etype == "system":
            subtype = event.get("subtype", "")
            if subtype == "init":
                ts = datetime.now().strftime("%H:%M:%S")
                tools = event.get("tools", [])
                print(
                    f"[{ts}] Session started ({len(tools)} tools available)",
                    flush=True,
                )

        elif etype == "assistant":
            msg = event.get("message", {})
            for block in msg.get("content", []):
                btype = block.get("type", "")
                if btype == "text":
                    text = block.get("text", "").strip()
                    if text:
                        text_chars += len(text)
                        print(text, flush=True)
                elif btype == "tool_use":
                    tool_count += 1
                    name = block.get("name", "")
                    inp = block.get("input", {})
                    print(format_tool(name, inp), flush=True)

        elif etype == "result":
            cost = event.get("cost_usd", 0)
            duration_ms = event.get("duration_ms", 0)
            duration_s = duration_ms / 1000
            turns = event.get("num_turns", 0)
            is_error = event.get("is_error", False)
            status = "ERROR" if is_error else "SUCCESS"
            print(
                f"\n{'=' * 50}\n"
                f"[DONE] {status} | {turns} turns | {tool_count} tool calls | "
                f"{duration_s:.0f}s | ${cost:.2f}\n"
                f"{'=' * 50}",
                flush=True,
            )


if __name__ == "__main__":
    main()
