# Vibe System V9.4 - Reference

> Detailed examples, templates, and bash scripts. Load on-demand: `cat .claude/REFERENCE.md`

---

## Version History

### V9.4
- Phase 5 skill loading enforcement (visual enforcement block matching Phase 4 TDD block)
- Prevents skipping verification/changelog/security-check skills

### V9.3
- Hook-enforced gates (`phase-gate.sh` returns exit 2)
- PRD Anchor pattern with START_FEATURE/END_FEATURE markers
- `/build-auto` for autonomous batch processing
- Mock data lifecycle enforcement

### V9.2
- Auto-Verify Mode for Phases 4-5
- Decision Gates vs Verification Gates
- TDD enforcement with RED phase proof

### V9.1
- PRD workflow integration
- Hierarchical feature tracking

### V9.0
- Unified design-system skill
- Context-aware skill loading

---

## Verification Gate Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  VERIFICATION GATE EXECUTION                                    │
├─────────────────────────────────────────────────────────────────┤
│    ┌──────────────┐                                             │
│    │ Run all      │                                             │
│    │ gate checks  │                                             │
│    └──────┬───────┘                                             │
│           ▼                                                     │
│    ┌──────────────┐     YES     ┌──────────────┐               │
│    │ All pass?    ├────────────►│ PROCEED      │               │
│    └──────┬───────┘             └──────────────┘               │
│           │ NO                                                  │
│           ▼                                                     │
│    ┌──────────────┐     NO      ┌──────────────┐               │
│    │ Attempt < 3? ├────────────►│ ESCALATE     │               │
│    └──────┬───────┘             └──────────────┘               │
│           │ YES                                                 │
│           ▼                                                     │
│    ┌──────────────┐                                             │
│    │ Fix + retry  │─────────────┐                               │
│    └──────────────┘             │ (loop)                        │
│           ▲                     │                               │
│           └─────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 4 Gate Checks

```bash
# TDD skill loaded
cat .claude/skills/tdd/SKILL.md  # Must be in history

# Baseline recorded
npm test 2>&1 | grep -E "[0-9]+ (passing|passed)"

# RED phase proven (must have failing test output in conversation)

# Test count increased
# Compare before/after

# No mock data
grep -r "mockData\|MOCK_" src/ 2>/dev/null | wc -l  # Must be 0

# Tests pass
npm test

# Build succeeds
npm run build
```

**Auto-Fix Actions:**

| Failed Check | Action |
|--------------|--------|
| TDD skill not loaded | `cat .claude/skills/tdd/SKILL.md` |
| No baseline | Run `npm test`, record count |
| No RED phase | Write failing test, capture output |
| Test count unchanged | Add tests for new functionality |
| Mock data present | Replace with real data context |
| Build failing | Debug and fix |

---

## Phase 5 Gate Checks

```bash
npm test                          # Tests pass
npm run build                     # Build succeeds
npm run lint                      # Lint passes (if configured)
grep -q "\[Unreleased\]" CHANGELOG.md  # CHANGELOG updated
# feature_list.json status = complete
# progress.md updated
```

---

## Escalation Template

```
⚠️ **Verification Gate Failed (3 attempts)**

Gate: Phase [X]
Failed checks:
- [check]: [error]

Attempts:
1. [tried]
2. [tried]
3. [tried]

**Options:**
- 🔧 Provide guidance
- ⏭️ Override (not recommended)
- 🔄 Try different approach
```

---

## Hook Flow Diagram

```
Stop Event
    │
    ▼
┌─────────────┐
│ Read from   │  progress.md:
│ progress.md │  **Phase:** 4
└──────┬──────┘  **Gate Status:** pending
       │         **Gate Attempt:** 1
       ▼
┌─────────────┐     NO
│Gate pending?├──────────► exit 0 (allow stop)
└──────┬──────┘
       │ YES
       ▼
┌─────────────┐     YES
│Attempt >= 3?├──────────► ESCALATE + exit 0
└──────┬──────┘
       │ NO
       ▼
┌─────────────┐
│ Run checks  │
└──────┬──────┘
       ▼
┌─────────────┐     PASS
│ Pass?       ├──────────► Update PASSED + exit 0
└──────┬──────┘
       │ FAIL
       ▼
Increment attempt
Write errors to stderr
exit 2 → Claude continues
```

---

## feature_list.json Structure

```json
{
  "project": "Project Name",
  "prds": [
    {
      "id": "F027",
      "name": "Feature Name",
      "status": "in_progress",
      "prd_file": "docs/prds/F027-name.md",
      "child_features": ["F027-001", "F027-002"]
    }
  ],
  "features": [
    {
      "id": "F027-001",
      "description": "Child feature",
      "status": "complete",
      "phase_completed": 5,
      "tests_added": 8,
      "spec_file": "F027-001.spec",
      "parent_prd": "F027"
    }
  ]
}
```

---

## progress.md Structure

```markdown
# Build Progress

## Current Feature
**ID:** F027-001
**Phase:** 4
**Gate Status:** pending
**Gate Attempt:** 1

## PRD Anchor (if from PRD)
**Feature:** F027-001
**From PRD:** docs/prds/F027-name.md

[Extracted child feature section - pointer only, not full copy]

## Last Completed
- F026-003: Dashboard layout (2024-12-28)
```

---

## PRD Child Feature Template

```markdown
### F027-001: [Feature Name]
<!-- START_FEATURE: F027-001 -->

**Purpose:** [One sentence]

**Scope:**
- ✅ IN SCOPE: [included]
- ❌ OUT OF SCOPE: [excluded]

**User Flow:**
1. User [action]
2. System [response]

**UI Requirements:**
- [Component]: [description]

**Data Requirements:**
- [Entity]: [fields]

**Acceptance Criteria:**
- [ ] AC1: [criterion]
- [ ] AC2: [criterion]

**Dependencies:** None | F027-XXX

<!-- END_FEATURE: F027-001 -->
```

---

## PRD Anchor (Pointer Pattern)

Instead of copying full PRD section, store pointer:

```markdown
## PRD Anchor
**Feature:** F027-001
**Source:** docs/prds/F027-dashboard.md
**Lines:** 145-195

To extract: `sed -n '145,195p' docs/prds/F027-dashboard.md`
```

---

## Phase 2 Design System Protocol

### Detect State
```bash
if [ -f "tailwind.config.ts" ] && [ -d "src/components/ui" ]; then
  echo "✓ Existing design system"
else
  echo "○ New project"
fi
```

### Load Skills
**New project:**
```bash
cat .claude/skills/ui/SKILL.md
cat .claude/skills/ui/REFERENCE.md
cat .claude/skills/ui/TEMPLATES.md
```

**Existing project:**
```bash
cat .claude/skills/ui/SKILL.md
cat tailwind.config.ts
ls src/components/ui/
```

---

## Phase 4 Entry Gate

```bash
echo "=== Phase 4 Entry Gate ==="
grep -q '"primary":' tailwind.config.ts && echo "✓ Colors" || echo "✗ Colors"
grep -qE "lucide-react|@heroicons" package.json && echo "✓ Icons" || echo "✗ Icons"
[ -f "src/components/ui/Button.tsx" ] && echo "✓ Button" || echo "✗ Button"
[ -f "DESIGN-SYSTEM.md" ] && echo "✓ Docs" || echo "✗ Docs"
```

**Checklist:**
- [ ] Semantic color tokens in tailwind.config.ts
- [ ] Icon library installed
- [ ] Button, Card, Badge, Input components
- [ ] DESIGN-SYSTEM.md exists
- [ ] User approved visual design

---

## Session Resume

```bash
# Check for in-progress
cat feature_list.json | grep -A5 '"status": "in_progress"'
head -50 progress.md
git log --oneline -5
```

If found:
```
📍 Resuming: [Feature]
   Phase: [X]
   Next: [action]

   Ready to continue?
```

---

## Context Management

**When to /clear:**
- New unrelated task
- Context pollution
- After completing feature
- Every 60-90 minutes in long sessions

**Before /clear:**
```bash
git add -A && git commit -m "wip: [state]"
# Update progress.md
# Update feature_list.json
```

---

## Safe Scaffolding

1. Backup .claude/ to /tmp/vibe-backup/
2. Scaffold in temp directory
3. Move scaffolded files
4. Restore .claude/
5. Commit

---

## Monorepo Detection

Check for:
- pnpm-workspace.yaml
- turbo.json
- package.json with workspaces

Ask user which package before proceeding.

---

## Design System Architecture

```
tailwind.config.ts          ← Source of truth
        ↓
src/components/ui/*         ← Semantic classes only
        ↓
src/app/**/*                ← Import components only
```

**Never:** raw color classes, inline SVG icons

---

## Regression Protection

| Command | Baseline | Verify |
|---------|----------|--------|
| /build | Phase 4 | Phase 4 |
| /quick | Step 2 | Step 4 |
| /fix | Phase 3 | Phase 6 |

---

## Changelog Integration

Auto-invoked after:
- /build Phase 5
- /quick Step 6
- /fix Phase 7
- /refactor completion

Categories: Added / Changed / Fixed
