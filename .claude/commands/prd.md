---
description: Create a Product Requirements Document for complex features. Usage: /prd "feature name"
---

> **Vibe System V9.1** - See `.claude/SYSTEM.md` for full documentation.

# /prd - Create Product Requirements Document

**Feature:** $ARGUMENTS

---

## When to Use /prd vs /build

```
┌─────────────────────────────────────────────────────────────┐
│                    DECISION GUIDE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Use /prd when:                    Use /build when:          │
│  ├─ Multiple child features        ├─ Single feature         │
│  ├─ Schema/database changes        ├─ UI-only changes        │
│  ├─ Architecture decisions         ├─ No new tables/models   │
│  ├─ Multi-phase rollout            ├─ Can ship in one phase  │
│  ├─ Cross-cutting concerns         ├─ Isolated scope         │
│  └─ > 1 week of work               └─ < 1 week of work       │
│                                                              │
│  /prd creates the PLAN              /build EXECUTES features │
│  /prd spawns child specs            /build creates ONE spec  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Confirm:** Is this a /prd-level feature (complex, multi-part)? If yes, proceed.

---

## STEP 0: LOAD PRD SKILL (REQUIRED)

```bash
cat .claude/skills/prd/SKILL.md
```

Announce: "✓ PRD skill loaded"

---

## STEP 1: GENERATE PRD ID

```bash
# Find next available PRD ID
LAST_ID=$(ls docs/prds/ 2>/dev/null | grep -oE 'F[0-9]{3}' | sort -u | tail -1 | grep -oE '[0-9]+')
if [ -z "$LAST_ID" ]; then
  NEXT_ID="F001"
else
  NEXT_ID=$(printf "F%03d" $((10#$LAST_ID + 1)))
fi
echo "PRD ID: $NEXT_ID"
```

---

## STEP 2: CAPTURE STRATEGIC CONTEXT

Before writing the PRD, understand the big picture:

### 2A: Problem Space

1. **What problem are we solving?** (Not features - the underlying pain)
2. **Who has this problem?** (Be specific - role, context)
3. **What's the impact of not solving it?** (Cost, time, frustration)
4. **What have we tried before?** (Why didn't it work?)

### 2B: Solution Vision

1. **What's the end state?** (When this is done, what's different?)
2. **What's the core insight?** (Why will this approach work?)
3. **What are the key constraints?** (Technical, timeline, resources)

**Wait for user to answer before continuing.**

---

## STEP 3: DEFINE CHILD FEATURES

Break the PRD into buildable chunks. Each child feature:
- Can be built in 1-3 days
- Has clear boundaries
- Can be tested independently
- Has its own spec file

### Present Child Feature List

```markdown
## 📋 Proposed Child Features

Based on the vision, here are the buildable features:

| ID | Name | Type | Priority | Dependencies |
|----|------|------|----------|--------------|
| [PRD_ID]-001 | [Feature 1] | frontend/backend | P1 | None |
| [PRD_ID]-002 | [Feature 2] | frontend | P1 | [PRD_ID]-001 |
| [PRD_ID]-003 | [Feature 3] | backend | P2 | None |

### Build Order
1. **Phase 1:** [PRD_ID]-001 (foundation)
2. **Phase 2:** [PRD_ID]-002, [PRD_ID]-003 (can parallel)
3. **Phase 3:** [PRD_ID]-004 (depends on 2)

---

**Does this breakdown make sense?**
- ✅ Yes, proceed to PRD document
- 🔄 Change: [adjust features]
- ➕ Add: [missing feature]
- ➖ Remove: [unnecessary feature]
```

**Wait for approval before continuing.**

---

## STEP 4: CREATE PRD DOCUMENT

Create `docs/prds/[PRD_ID]-[name].md` with this structure:

```markdown
# PRD: [Feature Name]

> **ID:** [PRD_ID]
> **Status:** Draft | In Progress | Complete
> **Author:** [Name]
> **Created:** [Date]
> **Last Updated:** [Date]

---

## Context Summary
<!-- This section is loaded by /build for child features. Keep under 50 lines. -->

**Vision:** [One sentence describing the end state]

**Problem:** [One sentence describing the pain point]

**Key Decisions:**
- [Architecture decision 1]
- [Architecture decision 2]
- [UX decision 1]

**Schema Changes:**
- [Table/model 1]: [purpose]
- [Table/model 2]: [purpose]

### Child Features

| ID | Name | Status | Spec File |
|----|------|--------|-----------|
| [PRD_ID]-001 | [Name] | pending | - |
| [PRD_ID]-002 | [Name] | pending | - |
| [PRD_ID]-003 | [Name] | pending | - |

---

## Problem Statement

### The Pain
[Detailed description of the problem]

### Root Cause
[Why does this problem exist?]

### Impact
[What happens if we don't solve this?]

---

## Solution

### Vision
[Detailed description of the end state]

### Key Insight
[Why will this approach work?]

### Scope

**In Scope:**
- [Feature/behavior 1]
- [Feature/behavior 2]

**Out of Scope:**
- [Explicitly excluded 1]
- [Explicitly excluded 2]

---

## Architecture

### System Changes
[Diagram or description of architectural changes]

### Data Model

```
[Entity 1]
├─ field1: type
├─ field2: type
└─ relationship → [Entity 2]

[Entity 2]
├─ field1: type
└─ field2: type
```

### Key Technical Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| [Decision 1] | [Why] | [What else we considered] |
| [Decision 2] | [Why] | [What else we considered] |

---

## Child Features (Detailed)

<!-- ⚠️ CRITICAL: /build extracts these sections verbatim. Be specific and complete. -->
<!-- Each child feature section is the SOURCE OF TRUTH for that feature's spec. -->
<!-- Claude MUST NOT invent requirements - only what's written here. -->

### [PRD_ID]-001: [Feature Name]
<!-- START_FEATURE: [PRD_ID]-001 -->

**Purpose:** [One sentence - what this feature does and why]

**Scope:**
- ✅ IN SCOPE: [Explicitly what IS included]
- ✅ IN SCOPE: [Another thing included]
- ❌ OUT OF SCOPE: [Explicitly what is NOT included]
- ❌ OUT OF SCOPE: [Another thing excluded]

**User Flow:**
1. User [specific action with context]
2. System [specific response]
3. User sees [specific outcome]
4. [Continue as needed]

**UI Requirements:**
- [Screen/Component 1]: [What it shows, what actions it supports]
- [Screen/Component 2]: [What it shows, what actions it supports]

**Data Requirements:**
- [Entity 1]: [Fields needed, relationships]
- [Entity 2]: [Fields needed, relationships]

**Acceptance Criteria:**
- [ ] AC1: [Specific, testable criterion with expected behavior]
- [ ] AC2: [Specific, testable criterion with expected behavior]
- [ ] AC3: [Specific, testable criterion with expected behavior]

**Edge Cases:**
- [Edge case 1]: [Expected behavior]
- [Edge case 2]: [Expected behavior]

**Dependencies:** None | [PRD_ID]-XXX

<!-- END_FEATURE: [PRD_ID]-001 -->

---

### [PRD_ID]-002: [Feature Name]
<!-- START_FEATURE: [PRD_ID]-002 -->

**Purpose:** [One sentence - what this feature does and why]

**Scope:**
- ✅ IN SCOPE: [Explicitly what IS included]
- ❌ OUT OF SCOPE: [Explicitly what is NOT included]

**User Flow:**
1. User [specific action with context]
2. System [specific response]
3. User sees [specific outcome]

**UI Requirements:**
- [Screen/Component]: [What it shows, what actions it supports]

**Data Requirements:**
- [Entity]: [Fields needed, relationships]

**Acceptance Criteria:**
- [ ] AC1: [Specific, testable criterion]
- [ ] AC2: [Specific, testable criterion]

**Edge Cases:**
- [Edge case]: [Expected behavior]

**Dependencies:** [PRD_ID]-001

<!-- END_FEATURE: [PRD_ID]-002 -->

---

## Implementation Plan

### Phase 1: [Name] (Week 1)
- [ ] [PRD_ID]-001: [Feature]
- [ ] [PRD_ID]-002: [Feature]

### Phase 2: [Name] (Week 2)
- [ ] [PRD_ID]-003: [Feature]

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to address] |

---

## Success Metrics

- [ ] [Metric 1]: [Target]
- [ ] [Metric 2]: [Target]

---

## Open Questions

- [ ] [Question 1]
- [ ] [Question 2]
```

---

## STEP 5: UPDATE FEATURE TRACKING

### Update feature_list.json

Add each child feature to the `features` array in `feature_list.json`. Each feature entry must include all fields used by the batch orchestrator:

```json
{
  "id": "[PRD_ID]-001",
  "name": "[Feature Name]",
  "type": "frontend|backend",
  "priority": 0,
  "status": "pending",
  "current_phase": 0,
  "batch": 1,
  "dependencies": [],
  "description": "[One-line description]",
  "prd": "docs/prds/[PRD_ID]-[name].md"
}
```

**Required fields:**
- `id`: Feature ID (e.g., `F002-001`)
- `name`: Human-readable name
- `type`: `"frontend"` or `"backend"`
- `priority`: 0 (P0) through 3 (P3)
- `status`: `"pending"` (set to `"complete"` when done)
- `current_phase`: 0 (not started) through 5 (verified)
- `batch`: Batch number (1-N) based on dependency order
- `dependencies`: Array of feature IDs this depends on (e.g., `["F002-001"]`)
- `description`: One-line description for logs/summaries
- `prd`: Path to the PRD file (e.g., `"docs/prds/F002-payments.md"`)

**Assign batch numbers** based on dependency order:
- Batch 1: Features with no dependencies (foundation)
- Batch 2: Features that depend only on Batch 1
- Batch 3+: Features that depend on earlier batches

Also add an `implementation_sequence` entry mapping batch labels to feature ID arrays:

```json
"implementation_sequence": {
  "batch_1_foundation": ["[PRD_ID]-001", "[PRD_ID]-002"],
  "batch_2_features": ["[PRD_ID]-003", "[PRD_ID]-004"],
  "batch_3_integration": ["[PRD_ID]-005"]
}
```

### Update progress.md

**REPLACE** the "Current Feature" section:
```markdown
## Current PRD
**ID:** [PRD_ID]
**Name:** [Feature Name]
**Status:** PRD Created

### Child Features
- ⏳ [PRD_ID]-001: [Name] - pending
- ⏳ [PRD_ID]-002: [Name] - pending
- ⏳ [PRD_ID]-003: [Name] - pending

### Next Steps
Run `/build "[PRD_ID]-001: [Feature Name]"` to start first child feature.
```

---

## STEP 6: PRD CHECKPOINT

**--- CHECKPOINT: STOP HERE ---**

Present the PRD summary:

```markdown
## 📋 PRD Complete: [Feature Name]

### Overview
- **PRD ID:** [PRD_ID]
- **PRD File:** docs/prds/[PRD_ID]-[name].md
- **Child Features:** [count]

### Child Features Ready to Build

| ID | Name | Priority | Run Command |
|----|------|----------|-------------|
| [PRD_ID]-001 | [Name] | P1 | `/build "[PRD_ID]-001: [Name]"` |
| [PRD_ID]-002 | [Name] | P1 | `/build "[PRD_ID]-002: [Name]"` |
| [PRD_ID]-003 | [Name] | P2 | `/build "[PRD_ID]-003: [Name]"` |

### Build Order
Start with: `/build "[PRD_ID]-001: [Name]"`

### Batch Orchestrator
To build all features autonomously:
```bash
scripts/build-batch.sh --prd [PRD_ID]
```
Or build a single feature: `/build "[PRD_ID]-001: [Name]"` or `scripts/build-batch.sh --feature [PRD_ID]-001`

---

**Ready to start building?**
- ✅ Yes, run `/build "[PRD_ID]-001: [Name]"` to start
- 🔄 Build all at once: `scripts/build-batch.sh --prd [PRD_ID]`
- 📝 Review PRD first
- 🔄 Make changes to PRD
```

---

## STEP 7: GIT COMMIT

```bash
git add docs/prds/[PRD_ID]-[name].md feature_list.json progress.md
git commit -m "prd: add [PRD_ID] - [Feature Name]

- Child features: [count]
- Phases: [count]
- Schema changes: [yes/no]"
```

---

## DONE

**What was created:**
- PRD document: `docs/prds/[PRD_ID]-[name].md`
- Feature tracking updated
- Child features defined and ready for `/build`

**Next step:** Run `/build "[PRD_ID]-001: [First Feature]"` to start building.

**The /build command will:**
1. Detect the parent PRD
2. Load the Context Summary section
3. Create a spec for the specific child feature
4. Build with full PRD context
