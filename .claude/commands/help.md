---
description: Get help with Vibe System. Usage: /help [topic]
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /help - Guidance

**Topic:** $ARGUMENTS

**For complete documentation, see `.claude/SYSTEM.md`**

---

## Commands

| Command | When to Use |
|---------|-------------|
| /quick | Small changes, < 50 lines |
| /build | New features (phased frontend-first workflow) |
| /feature-finish | After Phase 5: security check, doc verification, commit+push |
| /fix | Bug fixes |
| /refactor | Code improvement, no behavior change |
| /harden | Add tests to existing code |
| /batch | Process multiple tasks |
| /brainstorm | Explore vague ideas |
| /launch | Production readiness check |
| /status | See current state + feature tracking |

---

## What's New in V8.7

| Feature | Description |
|---------|-------------|
| **Fixed Checkpoints** | Phases 2 & 4 now STOP and WAIT before committing |
| **TDD Display** | TDD rules shown as visual block at Phase 4 start |
| **Auto-Resume** | Claude checks for in-progress work on first message |
| **Feature Tracking** | `feature_list.json` tracks builds across sessions |
| **Progress Log** | `progress.md` maintains session continuity |
| **Explicit Skill Loading** | Skills loaded via `cat` command (verifiable) |
| **Per-Phase Commits** | Git checkpoint after each phase |

---

## The V8.7 /build Workflow

```
Phase 1: Spec
├─ Load skills: cat .claude/skills/spec/SKILL.md
├─ Capture user context (who, device, goals)
├─ Present Feature Outline for approval ← KEY CHECKPOINT
├─ Create .spec file in docs/specs/
└─ Git commit: spec file

Phase 2: Visual Design
├─ Load skills: cat .claude/skills/ux/SKILL.md (etc.)
├─ Create design system FIRST
├─ Build ONLY approved screens
├─ User validates look/feel
└─ Git commit: UI components

Phase 3: Technical Design
├─ Load skills: cat .claude/skills/database/SKILL.md (etc.)
├─ Data models from validated UI
├─ WAIT for user approval ← CHECKPOINT
└─ Git commit: data model

Phase 4: Build
├─ Load skills: cat .claude/skills/tdd/SKILL.md (REQUIRED)
├─ ⚠️ TDD IS NON-NEGOTIABLE
├─ Record test count BEFORE
├─ Write tests FIRST, then implement
├─ Verify test count INCREASED
└─ Git commit: implementation + tests

Phase 5: Verification + Changelog
├─ Load skills: cat .claude/skills/verification/SKILL.md
├─ All tests pass, all criteria verified
├─ Update CHANGELOG.md
├─ Update feature_list.json: status = "complete"
└─ Git commit: verification complete
```

Each phase has ONE job. Can't skip ahead.

---

## Feature Tracking (V8.5)

Your builds are tracked in `feature_list.json`:

```json
{
  "features": [
    {
      "id": "auth-001",
      "description": "User authentication",
      "status": "complete",
      "tests_added": 8
    },
    {
      "id": "dashboard-002",
      "description": "Dashboard",
      "status": "in_progress",
      "current_phase": 4
    }
  ]
}
```

Session notes are in `progress.md` for continuity across sessions.

---

## Session Resume (V8.5)

When you start a new session, the system checks for in-progress work:

```
🔄 RESUME AVAILABLE: In-progress feature detected

📍 Resuming: Dashboard
   Phase: 4 - Build
   Last checkpoint: Data model approved
   Next: Implement with TDD
   
   Ready to continue?
```

---

## Context Management (V8.5)

Use `/clear` when:
- Starting a completely new task
- Context feels polluted
- After completing a feature
- Every 60-90 minutes in long sessions

**Before /clear, always:**
1. Commit current work
2. Update progress.md
3. Update feature_list.json if phase completed

---

## Common Questions

**"It built the wrong features"**
- You should see the Feature Outline first
- Say "Let's revisit the Feature Outline"

**"Tests are failing"**
- In Phase 4? Keep implementing
- After Phase 5? Debug with /fix

**"Can I skip tests?"**
- Use /quick for tiny changes
- Use /harden later to add tests
- /build requires TDD - **non-negotiable**

**"Stuck on same error"**
- 3-failure rule: stop, try different approach
- Spawn fixer agent: `.claude/agents/fixer.md`

**"How do I resume?"**
- Run /status to see in-progress features
- Read progress.md for last session notes
- Read `docs/specs/[feature].spec` to refresh context

**"How do I upgrade?"**
1. Backup custom skills/commands if any
2. Delete `.claude/` folder
3. Extract new vibe-system zip
4. Run `chmod +x .claude/hooks/*.sh`
5. Done - your CLAUDE.md is untouched

---

## Skill Loading (V8.5)

Skills are loaded explicitly, not auto-loaded:

```bash
cat .claude/skills/tdd/SKILL.md
```

After loading, announce: "✓ TDD skill loaded"

This makes skill loading verifiable in the output.
