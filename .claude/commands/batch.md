---
description: Process multiple tasks autonomously. Usage: /batch
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /batch - Batch Processing Mode

Process tasks from .tasks file.

---

## Prerequisites

1. .tasks file exists with pending tasks
2. Each task is well-defined
3. Maximum 5-7 tasks per batch

---

## Batch Execution

For each task:

1. **Determine type** - Is it /quick, /build, or /fix?
2. **Execute** - Follow appropriate workflow
3. **Mark complete** - `[x] Task (YYYY-MM-DD)`
4. **Commit** - After each task

---

## Gates (Auto Mode)

For /build tasks in batch mode, gates are automatic:
- Phase 3 complete when: `npm test` shows failing tests
- Phase 4 complete when: `npm test` shows passing tests
- Phase 5 complete when: `npm run build` succeeds

---

## REVIEW Tasks

When encountering `[REVIEW]` tag:
1. Stop batch processing
2. Notify user
3. Wait for approval

---

## Completion

```markdown
## Batch Run - [Date]
- Completed: X tasks
- Stuck: Y tasks (marked [!])
- Time: ~Z minutes
```
