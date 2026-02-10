---
description: Build a complete feature with frontend-first TDD. Usage: /build "feature description"
---

> **Vibe System V9.4** - See `.claude/SYSTEM.md` for full documentation.

# /build - Build a Feature (Frontend-First Workflow)

**Feature:** $ARGUMENTS

---

## How This Works

Building happens in 5 phases. Each phase has ONE job and produces specific artifacts. You cannot skip phases.

**V9.4 Key Features:**
- **PRD Compliance Enforcement:** Extracts FULL child feature section from PRD as source of truth
- **PRD Anchor in progress.md:** Requirements always visible, prevents "inventing" features
- **Hook-Enforced Gates:** Stop hooks with exit code 2 force iteration until pass
- **Auto-Verify Mode:** Phases 4-5 self-verify and iterate (no human babysitting)
- **Two Gate Types:** Decision Gates (human) vs Verification Gates (machine)
- **TDD Enforcement:** Must prove RED phase with failing test output (visual enforcement block)
- **Phase 5 Skill Enforcement:** Must load verification/changelog/security skills (visual enforcement block)
- **Iterate Until Pass:** Failed checks trigger auto-fix + retry (max 3)
- **Mock Data Lifecycle:** Phase 2 requires mock data, Phase 4 replaces it
- Per-phase git commits for resume/rollback
- feature_list.json + progress.md tracking

**Gate Types:**
| Phase | Gate Type | Behavior |
|-------|-----------|----------|
| Phase 1 | 🛑 DECISION | STOP and WAIT for human approval |
| Phase 2 | 🛑 DECISION | STOP and WAIT for human approval |
| Phase 3 | 🛑 DECISION | STOP and WAIT for human approval |
| Phase 4 | 🔄 VERIFICATION | Auto-verify, fix, retry (max 3) |
| Phase 5 | 🔄 VERIFICATION | Auto-verify, fix, retry (max 3) |

---

## PRE-FLIGHT CHECK

### Load Project Knowledge Index (The Pin)

**Before anything else, load The Pin to understand the project:**

```bash
cat docs/specs/readme.md
```

After reading, announce: "✓ The Pin loaded - [X] concepts, [Y] features indexed"

**The Pin provides:**
- Concept definitions (domain entities, workflows, etc.)
- Source code locations (what module handles what)
- Feature status (what's built vs pending)
- Architecture decisions (integrations, data flow, etc.)

**⚠️ Without The Pin, you risk inventing features that contradict existing architecture.**

---

### Is this actually a /build?

**Use /quick instead if:**
- Less than 50 lines of changes
- 1-2 files only
- No new features, just modifications
- Known patterns, no design needed

**Use /build if:**
- New feature or capability
- Multiple files needed
- Requires design decisions
- Should have test coverage

**Confirm:** This is a /build task. Proceeding with frontend-first phased workflow.

---

## PRD CONTEXT CHECK (V9.3 - Enhanced)

**Before starting, check if this feature has a parent PRD and extract FULL requirements.**

### Detect Parent PRD

```bash
# Check if feature ID pattern suggests a parent PRD (e.g., F029-001 → F029)
FEATURE_ARG="$ARGUMENTS"
FEATURE_ID=$(echo "$FEATURE_ARG" | grep -oE '^F[0-9]{3}-[0-9]{3}' | head -1)
PRD_ID=$(echo "$FEATURE_ID" | grep -oE '^F[0-9]{3}' | head -1)

if [ -n "$PRD_ID" ]; then
  # Look for matching PRD file
  PRD_FILE=$(ls docs/prds/${PRD_ID}* docs/prds/*${PRD_ID}* 2>/dev/null | head -1)

  if [ -n "$PRD_FILE" ]; then
    echo "✓ Parent PRD detected: $PRD_FILE"
  fi
fi
```

### If Parent PRD Found

**⚠️ CRITICAL: Extract the FULL child feature section, not just the summary.**

```bash
# Extract the specific child feature section using markers
sed -n "/<!-- START_FEATURE: $FEATURE_ID -->/,/<!-- END_FEATURE: $FEATURE_ID -->/p" "$PRD_FILE"
```

**If no markers found, extract by heading:**
```bash
# Fallback: Extract from heading to next heading
sed -n "/### $FEATURE_ID:/,/### F[0-9]/p" "$PRD_FILE" | head -n -1
```

**Store PRD ANCHOR pointer in progress.md (NOT the full content):**

```markdown
## PRD Anchor (Source of Truth)
**Feature:** [FEATURE_ID]
**Source:** [PRD_FILE]
**Extract:** `sed -n '/<!-- START_FEATURE: [FEATURE_ID] -->/,/<!-- END_FEATURE: [FEATURE_ID] -->/p' [PRD_FILE]`

<!-- ⚠️ DO NOT INVENT REQUIREMENTS. Re-extract from PRD when needed. -->
```

**Announce:**
```
📋 PRD Anchor set: [FEATURE_ID] from [PRD_FILE]
   Purpose: [one line]
   ACs: [count]
   ⚠️ I will NOT invent features beyond PRD scope.
```

### PRD Compliance Rule (V9.3)

**At EVERY phase, verify against the PRD Anchor:**

| Phase | PRD Compliance Check |
|-------|---------------------|
| Phase 1 | Spec only includes what PRD specifies |
| Phase 2 | UI matches PRD's UI Requirements section |
| Phase 3 | Data model matches PRD's Data Requirements |
| Phase 4 | Implementation covers all PRD ACs |
| Phase 5 | Verify each PRD AC is met |

**If you find yourself adding features not in the PRD → STOP.**
Ask: "I notice this isn't in the PRD. Should I add it, or stick to the PRD scope?"

### If No Parent PRD

Proceed normally. This is a standalone feature.

### Feature ID Convention

When building from a PRD:
- PRD ID: `F029` (the parent)
- Child feature: `F029-001`, `F029-002`, etc.
- Spec file: `docs/specs/F029-001-[name].spec`

---

## STATE INITIALIZATION (V8.7)

### Check/Create feature_list.json

```bash
if [ ! -f "feature_list.json" ]; then
  echo '{
  "project": "[Project Name]",
  "created_at": "'$(date -Iseconds)'",
  "features": []
}' > feature_list.json
fi
```

### Check/Create progress.md

```bash
if [ ! -f "progress.md" ]; then
  echo '# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for first build

---

## Last Completed
(No features completed yet)

---

## Project State
- **Tests:** 0 passing
- **Build:** not yet run
' > progress.md
fi
```

**IMPORTANT: progress.md Structure (V8.8)**

progress.md uses a **fixed structure** that gets **replaced, not appended**:
- **Current Feature** section: Replaced at each phase transition
- **Last Completed** section: Replaced when a feature completes (previous content moves here)
- **Project State** section: Updated with current stats

This prevents the file from growing indefinitely across sessions.

### Add Feature to Tracking

Generate a feature ID and add to feature_list.json:

```json
{
  "id": "[PRD_ID]-[number] or [short-id]",
  "description": "$ARGUMENTS",
  "status": "in_progress",
  "current_phase": 1,
  "started_at": "[timestamp]",
  "parent_prd": "[PRD_ID] or null",
  "spec_file": "docs/specs/[feature].spec"
}
```

**If this feature has a parent PRD:**
- Use the child feature ID from the PRD (e.g., `F029-003`)
- Set `parent_prd` to the PRD ID (e.g., `F029`)
- Update the PRD's Child Features table with the spec file path

---

## PHASE 1: SPECIFICATION

**Goal:** Define WHO we're building for and WHAT we're building.

### STEP 1.0: LOAD SKILLS (REQUIRED)

Run these commands NOW:

```bash
cat .claude/skills/spec/SKILL.md
cat .claude/skills/ux/SKILL.md
```

After reading each skill, announce:
- "✓ Spec skill loaded"
- "✓ UX skill loaded"

**⚠️ ENFORCEMENT:** You cannot proceed without loading these skills. You cannot rationalize skipping this step.

### STEP 1.1: LOAD RULES (CONDITIONAL)

Load domain rules only when relevant to the feature:

```bash
# If feature involves RBAC, users, roles, permissions, teams, or members:
cat .claude/rules/rbac.md

# If feature involves reports, fields, schemas, or Service Titan data:
cat .claude/rules/report-schema.md
```

Skip rules loading if the feature doesn't match these domains.

---

### Constraints
- ✅ Capture user context
- ✅ Present Feature Outline for approval
- ✅ Create .spec file in docs/specs/ with approved outline
- ❌ Do NOT write any code
- ❌ Do NOT design components
- ❌ Do NOT create files other than .spec

---

### STEP 1A: User Context Questions

Before writing anything, understand the user:

1. **Who is the primary user?** (Name them if possible)
2. **What is their context?** (Desktop at office? Mobile on-the-go?)
3. **What are their top 3 goals?** (What questions need answered at a glance?)
4. **What's their mental model?** (How do they think about this domain?)

**Wait for user to answer before continuing.**

---

### STEP 1B: Feature Outline (CRITICAL CHECKPOINT)

**After user context is captured, present the Feature Outline:**

```markdown
## 📋 Proposed Feature Outline

Based on [User]'s goals ([goal 1], [goal 2], [goal 3]), here's what I'm planning to build:

### Screens/Pages
1. **[Screen 1]** - [What it shows, why it matters]
2. **[Screen 2]** - [What it shows, why it matters]
3. **[Screen 3]** - [What it shows, why it matters]

### Key User Flows
1. **[Flow 1]:** [User] opens app → [step] → [outcome]
2. **[Flow 2]:** [User] wants to [goal] → [step] → [outcome]
3. **[Flow 3]:** [User] needs to [action] → [step] → [outcome]

### Out of Scope (for this build)
- [Feature not included]
- [Feature not included]

---

**Does this match what you're envisioning?**
- ✅ Looks good, proceed
- ➕ Add: [feature I forgot]
- ➖ Remove: [feature I don't need]
- 🔄 Change: [something is wrong]
```

**⚠️ DO NOT proceed until user explicitly approves the outline.**

- If user adds features → Update outline, **show updated outline, re-confirm**
- If user removes features → Move to Out of Scope, **show updated outline, re-confirm**
- If user approves → Continue to acceptance criteria

**V8.5 Re-confirm Rule:** After ANY modification to the outline, you MUST:
1. Show the updated outline
2. Ask: "Does this updated outline look right?"
3. Wait for explicit approval before proceeding

Do NOT assume "yes, but add X" means "go ahead and build."

---

### STEP 1C: Finalize Specification

After outline is approved:

1. **Feature Discovery** - Ask about auth, persistence, mobile, offline, etc.
2. **CRUD Completeness** - Confirm operations for each entity
3. **Create .spec file** in `docs/specs/` with all sections

### Deliverable

Create `docs/specs/[feature].spec` file:

```markdown
# Feature: [Name]

## User Context
- **Primary User:** [Who is this for? Name them.]
- **Context:** [When/where do they use this? Device?]
- **Top Goals:**
  1. [Most important goal]
  2. [Second priority]
  3. [Third priority]
- **Mental Model:** [How do they think about this domain?]
- **Key Questions:** [What do they need to know at a glance?]

## Feature Outline (Approved)

### Screens
1. **[Screen 1]** - [Purpose]
2. **[Screen 2]** - [Purpose]
3. **[Screen 3]** - [Purpose]

### Key User Flows
1. [Flow description]
2. [Flow description]
3. [Flow description]

### Out of Scope
- [Excluded feature 1]
- [Excluded feature 2]

## User Story
As a [user type]
I want to [action]
So that [benefit]

## Acceptance Criteria
- [ ] AC1: [Testable criterion]
- [ ] AC2: [Testable criterion]
- [ ] AC3: [Testable criterion]

## Edge Cases
- [Edge case 1]: Expected behavior
- [Edge case 2]: Expected behavior

## Success Definition
We'll know this works when: [observable outcome]
```

---

### PHASE 1 COMPLETE

**--- 🛑 DECISION GATE: STOP HERE ---**

Present the specification summary to the user:

```markdown
## 📋 Phase 1 Complete: Specification

### Feature Summary
- **Primary User:** [who]
- **Context:** [device/situation]
- **Top Goals:** [1, 2, 3]

### Approved Outline
- Screens: [count] ([list])
- User Flows: [count]
- Out of Scope: [list]

### Acceptance Criteria
- [count] testable criteria defined

---

**🛑 DECISION GATE: Does this specification look complete?**

This is YOUR vision - I need your approval before proceeding.

- ✅ Yes, proceed to Phase 2
- 🔄 Change: [something needs adjustment]
- ➕ Add: [missing requirement]
```

**⚠️ DECISION GATE: WAIT for user response before proceeding.**

Do NOT commit, do NOT update tracking files, do NOT start Phase 2 until user approves.

---

### STEP 1D: Phase 1 Commit (V8.7)

**ONLY after user approves the specification:**

```bash
git add docs/specs/[feature].spec feature_list.json progress.md
git commit -m "spec: add [feature] specification

- User: [primary user type]
- Screens: [count]
- Flows: [count]
- Acceptance criteria: [count]"
```

Update feature_list.json: `current_phase = 2`

**REPLACE** the "Current Feature" section in progress.md with:
```markdown
## Current Feature
**ID:** [feature-id]
**Phase:** 1 → 2
**Status:** Spec approved, starting visual design

**Spec:** `docs/specs/[feature].spec`
- User: [primary user]
- Screens: [count]
- Flows: [count]
- Acceptance criteria: [count]
```

Now proceed to Phase 2.

---

## PHASE 2: VISUAL DESIGN + UX

**Goal:** Create a visual UI the user can validate. Include realistic mock data.

**⚓ Context Anchor:** Re-read `docs/specs/[feature].spec` to refresh on user context, goals, AND approved outline before starting.

---

### STEP 2.0: LOAD SKILLS (REQUIRED)

Phase 2 has three sequential steps. Follow this order:

**Step 2.1: User Flows**
```bash
cat .claude/skills/ux/SKILL.md
```
Announce: "✓ UX skill loaded"

**Step 2.2: Design System (context-aware loading)**
```bash
# Always load core skill
cat .claude/skills/ui/SKILL.md

# For NEW projects (no tailwind.config.ts), also load:
cat .claude/skills/ui/REFERENCE.md   # Decision tables
cat .claude/skills/ui/TEMPLATES.md   # Config + components

# For EXISTING projects: Read the project's existing design system
cat tailwind.config.ts
ls src/components/ui/
```
Announce: "✓ UI skill loaded"

**Step 2.3: Accessibility**
```bash
cat .claude/skills/accessibility/SKILL.md
```
Announce: "✓ Accessibility skill loaded"

**⚠️ ENFORCEMENT:** You cannot proceed without loading these skills.

---

### Constraints
- ✅ Create working UI with mock data
- ✅ Build ONLY the approved screens from the outline
- ✅ Implement ONLY the approved flows from the outline
- ✅ Professional design quality (NOT optional)
- ✅ 3-4 realistic sample items showing different states
- ❌ NO backend / data persistence
- ❌ NO tests yet
- ❌ NO architecture decisions
- ❌ NO screens/features not in the approved outline

### Mock Data Requirements

Include realistic seed data, not placeholder text:

**Minimum:**
- 3-4 sample items showing different states
- At least one item in each status (active, completed, overdue, etc.)
- Realistic names and values (not "Test Project 1")
- Edge cases visible (long names, large numbers, empty states)

### Design Quality Checklist

Your UI must pass these checks:
- [ ] Looks like a real SaaS product someone would pay for
- [ ] Clear visual hierarchy (most important = most prominent)
- [ ] Consistent spacing (4, 8, 12, 16, 24, 32 scale)
- [ ] No generic AI aesthetics (no purple gradients, no rainbow colors)
- [ ] All states covered: default, hover, loading, error, empty
- [ ] Information architecture matches user's mental model
- [ ] Primary actions are obvious and accessible
- [ ] Mobile-friendly if user is mobile (from spec)

### First /build in this project?

If no ARCHITECTURE.md exists:
1. Spawn initializer agent: `.claude/agents/initializer.md`
2. Create minimal ARCHITECTURE.md with stack decisions
3. Create feature_list.json and progress.md

### Phase 2 Deliverables

**If this is a new project, create design system FIRST:**

1. **Tailwind Config** (source of truth)
   - `tailwind.config.ts` - semantic color tokens, spacing, typography, radius, shadows
   - See `design-system/TEMPLATES.md` for complete config structure

2. **Icon Library** (required)
   - Install: `npm install lucide-react` (or heroicons/phosphor)
   - Create: `src/components/ui/Icon.tsx` wrapper component

3. **Shared Components** (enforcement layer)
   - `src/components/ui/*` - Icon, Button, Card, Badge, Input
   - Components use ONLY semantic Tailwind classes (`bg-primary`, `text-foreground-muted`)

4. **Feature Pages**
   - Use shared components only
   - Realistic mock data visible
   - All approved screens implemented

---

### Visual Verification with Chrome (V8.7)

After creating UI components, verify visually before requesting approval:

1. **Start dev server:** `npm run dev`

2. **Open in Claude Chrome tab group:**
   - Navigate to http://localhost:3000 (or appropriate port)
   - Claude can see and interact with the page

3. **Verify each screen:**
   - Does it match the approved wireframe/design?
   - Check mobile viewport (DevTools responsive mode)
   - Check all states: empty, loading, error, populated

4. **Check browser console:**
   - Any JavaScript errors?
   - Any React/framework warnings?
   - Any failed network requests?

5. **Report findings** before requesting Phase 2 approval:
   ```
   ### Browser Verification (Phase 2)
   - Screens verified: [list]
   - Console errors: [count]
   - Visual issues: [list or "None"]
   ```

**If issues found:** Fix them before requesting approval.

---

### PHASE 2 COMPLETE

**--- 🛑 DECISION GATE: STOP HERE ---**

Present the visual design to the user:

```markdown
## 🎨 Phase 2 Complete: Visual Design

Here's what I've built:

### Components Created
- [Component 1] - [purpose]
- [Component 2] - [purpose]

### Design System
- [New/Existing]
- Color tokens: [semantic names used]

### Mock Data
- [X] sample items visible
- [X] different states shown (active, completed, etc.)

---

**🛑 DECISION GATE: Does this visual design look right?**

This requires your aesthetic judgment - I need your approval.

- ✅ Looks good, proceed to Phase 3
- 🔄 Change: [something needs adjustment]
- ➕ Add: [missing element]
```

**⚠️ DECISION GATE: WAIT for user response before proceeding.**

Do NOT commit, do NOT update tracking files, do NOT start Phase 3 until user approves.

---

### STEP 2D: Phase 2 Commit (V8.7)

**ONLY after user approves the visual design:**

```bash
git add -A
git commit -m "design: add [feature] UI components

- Components created: [list]
- Design system: [new/existing]
- User approved visual direction"
```

Update feature_list.json: `current_phase = 3`

**REPLACE** the "Current Feature" section in progress.md with:
```markdown
## Current Feature
**ID:** [feature-id]
**Phase:** 2 → 3
**Status:** Visual design approved, starting technical design

**Spec:** `docs/specs/[feature].spec`
**Components:** [list]
**Mock data:** visible
```

Now proceed to Phase 3.

---

## PHASE 3: TECHNICAL DESIGN

**Goal:** Design the data models AFTER the UI is validated. Present for approval.

**⚓ Context Anchor:** Re-read `docs/specs/[feature].spec` AND review the approved UI before starting.

---

### STEP 3.0: LOAD SKILLS (REQUIRED)

Run these commands NOW:

```bash
cat .claude/skills/database/SKILL.md
cat .claude/skills/backend/SKILL.md
cat .claude/skills/architecture/SKILL.md
```

After reading each skill, announce:
- "✓ Database skill loaded"
- "✓ Backend skill loaded"
- "✓ Architecture skill loaded"

---

### Constraints
- ✅ Define data models from validated UI
- ✅ Present models for user approval
- ❌ NO implementation yet
- ❌ NO tests yet

### What to Design

From the approved UI, identify:
1. **Entities** - What data objects are visible?
2. **Properties** - What fields does each need?
3. **Relationships** - How do they connect?
4. **Storage** - localStorage for MVP, or database?

### Present Data Model

Show the user what you're planning:

```markdown
## 📊 Proposed Data Model

Based on the approved UI, here are the data structures:

**[Entity 1]**
- id: string (UUID)
- name: string
- status: "active" | "completed" | "archived"
- createdAt: Date

**[Entity 2]**
- id: string (UUID)
- [entity1]Id: string (FK)
- description: string

### Relationships
- [Entity1] has many [Entity2]
- [Entity2] belongs to [Entity1]

### Storage
- localStorage for MVP (can migrate to database later)
```

---

### PHASE 3 COMPLETE

**--- 🛑 DECISION GATE: STOP HERE ---**

Present the data model summary to the user:

```markdown
## 📊 Phase 3 Complete: Technical Design

### Data Model
- **Entities:** [list with field counts]
- **Relationships:** [how they connect]
- **Storage:** [localStorage/database]

### What This Enables
- [CRUD operation 1]
- [CRUD operation 2]

---

**🛑 DECISION GATE: Does this data model make sense?**

Data model changes are expensive later - I need your approval.

- ✅ Yes, proceed to Phase 4
- 🔄 Change: [structure needs adjustment]
- ➕ Add: [missing field or entity]
```

**⚠️ DECISION GATE: WAIT for user response before proceeding.**

Do NOT commit, do NOT update tracking files, do NOT start Phase 4 until user approves.

---

### STEP 3D: Phase 3 Commit (V8.7)

**ONLY after user approves the data model:**

```bash
git add -A
git commit -m "arch: add [feature] data model

- Entities: [list]
- Storage: [localStorage/database]
- User approved structure"
```

Update feature_list.json: `current_phase = 4`

**REPLACE** the "Current Feature" section in progress.md with:
```markdown
## Current Feature
**ID:** [feature-id]
**Phase:** 3 → 4
**Status:** Data model approved, starting TDD implementation

**Spec:** `docs/specs/[feature].spec`
**Entities:** [list]
**Storage:** [type]
```

Now proceed to Phase 4.

---

## PHASE 4: BUILD

**Goal:** Write tests, implement data layer, connect UI to real data.

**⚓ Context Anchor:** Re-read `docs/specs/[feature].spec` to refresh on user context and goals.

---

### BEFORE Writing Any External Library Code (V8.7)

**🔍 MANDATORY: Check documentation first using Ref MCP**

Before implementing ANY external API, library, or service:

```
Use ref_search_documentation to find current API signatures for [library name]
```

**Example workflow:**
1. Need to use Stripe? → `ref_search_documentation("Stripe create checkout session")`
2. Need Prisma relations? → `ref_search_documentation("Prisma findMany include nested")`
3. Need Next.js middleware? → `ref_search_documentation("Next.js 15 middleware cookies")`

Read the returned docs, THEN write code matching the **current** API.

**Why this matters:** Claude's training data contains outdated APIs. Ref has current docs.
Skipping this step = debugging code that was never going to work.

**Anti-pattern to avoid:**
```
❌ Write code from memory → Error → Try different method → Error → Try again...
```

**Correct pattern:**
```
✅ ref_search_documentation first → Write correct code → Works first time
```

---

### STEP 4.1: LOAD SKILLS (REQUIRED)

Run these commands NOW:

```bash
cat .claude/skills/tdd/SKILL.md
cat .claude/skills/testing/SKILL.md
cat .claude/skills/error-handling/SKILL.md
```

After reading, announce:
- "✓ TDD skill loaded"
- "✓ Testing skill loaded"
- "✓ Error-handling skill loaded"

---

### STEP 4.2: BASELINE (REQUIRED)

**Before ANY implementation:**

```bash
npm test 2>&1
```

Record: "Baseline: [X] tests passing"

---

### STEP 4.3: IMPLEMENT WITH TDD

**⚠️ ENFORCEMENT: TDD IS NON-NEGOTIABLE ⚠️**

**Display this block to the user NOW:**

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  TDD IS NON-NEGOTIABLE                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  You MUST follow Red-Green-Refactor:                        │
│                                                             │
│  1. RED:    Write a failing test FIRST                      │
│  2. GREEN:  Write minimal code to pass                      │
│  3. REFACTOR: Clean up while tests stay green               │
│  4. REPEAT: For each new behavior                           │
│                                                             │
│  You CANNOT:                                                │
│  ✗ Write implementation before tests                        │
│  ✗ Skip the RED phase                                       │
│  ✗ Rationalize "I'll add tests after"                       │
│  ✗ Claim "this is too simple for tests"                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Frontend-First Note:** Since UI was built in Phase 2, you're testing the DATA LAYER and BUSINESS LOGIC now. The UI already exists — write tests for:
- Data context/state management
- CRUD operations
- Validation logic
- Edge cases

### The TDD Cycle

1. **RED:** Write a failing test
   - Run `npm test` — see it fail
   - If it passes, you're testing the wrong thing

2. **GREEN:** Write minimal code to pass
   - No extra features
   - No optimization
   - Just make the red go green

3. **REFACTOR:** Clean up
   - Tests still pass
   - Remove duplication
   - Improve clarity

4. **REPEAT** for each behavior

**If you catch yourself about to skip TDD:**
1. STOP immediately
2. Re-read: `cat .claude/skills/tdd/SKILL.md`
3. Write the failing test FIRST
4. Then proceed

**This is not a suggestion. This is how professional software is built.**

---

### STEP 4.4: ELIMINATE MOCK DATA

After implementation:

```bash
grep -r "mockData" src/
grep -r "MOCK_" src/
```

**Required:** Both commands return nothing.

Verify each page:
- [ ] Page 1: Uses DataContext ✓
- [ ] Page 2: Uses DataContext ✓
- [ ] (all pages)

---

### STEP 4.5: VERIFY CRUD

- [ ] CREATE: Forms submit and save
- [ ] READ: Data displays correctly
- [ ] UPDATE: Edit forms save changes
- [ ] DELETE: Delete buttons work

---

### STEP 4.6: VERIFY TEST INCREASE

```bash
npm test 2>&1
```

Compare:
- Tests before: [X]
- Tests after: [Y]
- New tests: [Y-X]

**If new CRUD was added but tests didn't increase → STOP.**
Go back and add tests.

---

### STEP 4.7: Phase 4 Verification Gate

**🔄 VERIFICATION GATE - Auto-verify via `phase-gate.sh` hook**

The hook checks: TDD proven, tests pass, mock data removed, build succeeds.

> For full gate script: `cat .claude/REFERENCE.md` (Phase 4 Gate Checks section)

**Gate Behavior:**
- Pass → Proceed to Phase 5
- Fail (attempt < 3) → Fix and retry
- Fail (attempt = 3) → Escalate to human

Update progress.md: `**Gate Status:** pending` to trigger hook.

**On Gate Pass - Commit:**

```bash
git add -A
git commit -m "feat: implement [feature]

- Tests: [X] added ([Y] total)
- CRUD operations: verified
- Mock data: eliminated
- Phase 4 gate: PASSED"
```

Update feature_list.json: `current_phase = 5`

**REPLACE** the "Current Feature" section in progress.md with:
```markdown
## Current Feature
**ID:** [feature-id]
**Phase:** 4 → 5
**Status:** Implementation complete, verification gate passed

**Spec:** `docs/specs/[feature].spec`
**Tests:** [Y] passing (+[diff] new)
**Mock data:** eliminated
**CRUD:** verified
**Gate:** Phase 4 PASSED
```

---

### PHASE 4 COMPLETE

**🔄 VERIFICATION GATE PASSED** - Announce: "Phase 4 gate passed, proceeding to Phase 5"

> Escalation template: `cat .claude/REFERENCE.md` (Escalation Template section)

---

## PHASE 5: VERIFICATION

**Goal:** Full verification against specification.

**⚓ Context Anchor:** Re-read `docs/specs/[feature].spec` to refresh on user context, approved outline, and goals.

---

### STEP 5.0: LOAD SKILLS AND RULES (REQUIRED)

Run these commands NOW:

```bash
cat .claude/skills/verification/SKILL.md
cat .claude/skills/changelog/SKILL.md
cat .claude/skills/security-check/SKILL.md
cat .claude/rules/documentation-updates.md
```

After reading, announce:
- "✓ Verification skill loaded"
- "✓ Changelog skill loaded"
- "✓ Security-check skill loaded"
- "✓ Documentation rules loaded"

**⚠️ ENFORCEMENT:** You cannot proceed without loading these skills. You cannot rationalize skipping this step.

**Display this block to the user NOW:**

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  PHASE 5 SKILLS ARE NON-NEGOTIABLE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  You MUST load all 4 files above BEFORE any verification.   │
│                                                             │
│  You CANNOT:                                                │
│  ✗ Skip skill loading and "just run the checks"             │
│  ✗ Rationalize "I already know how to verify"               │
│  ✗ Skip changelog skill because "docs are simple"           │
│  ✗ Skip security-check "since there's no auth"              │
│                                                             │
│  The skills contain CURRENT project requirements.           │
│  Your training data is outdated.                            │
│  Load them. Every time.                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**If you catch yourself about to skip skill loading:**
1. STOP immediately
2. Run the cat commands above
3. Read each skill completely
4. Then proceed with verification

---

### Verification Checklist

**1. Tests pass (fresh run)**
```bash
npm test 2>&1
```

**2. Build succeeds**
```bash
npm run build 2>&1
```

**3. Spec compliance**

Go through each acceptance criterion in `docs/specs/[feature].spec`:
- [ ] AC1: Implemented? Tested?
- [ ] AC2: Implemented? Tested?
- [Continue for all]

**4. Outline compliance**

Verify against approved Feature Outline:
- [ ] All approved screens implemented?
- [ ] All approved flows working?
- [ ] No out-of-scope features added?

**5. Edge cases**

Check each edge case from the .spec:
- [ ] Edge case 1: Handled correctly?
- [ ] Edge case 2: Handled correctly?

**6. Error handling**
- [ ] Invalid inputs handled?
- [ ] User sees friendly error messages?
- [ ] No stack traces exposed?

**7. User context verification**
- [ ] Primary user's top goals are easily achievable?
- [ ] Information architecture matches mental model?
- [ ] Works in user's context (mobile/desktop)?

**8. Security audit (REQUIRED - Adaptive)**

Follow the security-check skill process (already loaded in Step 5.0):

1. **Detect change categories** from `git diff --name-only HEAD~5`
2. **Run targeted checks** based on what changed (auth, API, DB, frontend, etc.)
3. **Always run secrets scan** regardless of change type
4. **Report using adaptive format** (skip irrelevant checks)

The skill will guide you to:
- Skip auth audit if no auth code changed
- Skip DB audit if no database code changed
- Focus on XSS if only frontend changed
- etc.

**Exit criteria:** No CRITICAL/HIGH issues. Secrets scan passed.

---

### Browser Verification (V8.7)

Before marking feature complete, verify in real browser:

1. **Open app in Chrome** (Claude Chrome extension)
   - Use the safe Chrome profile
   - Navigate to localhost

2. **Run through each user flow from spec:**
   | Flow | Status | Notes |
   |------|--------|-------|
   | [flow from spec] | ✅/❌ | [any issues] |

3. **Check browser console for:**
   - JavaScript errors (console.error)
   - Failed network requests (4xx, 5xx)
   - React/framework warnings
   - Unhandled promise rejections

4. **Verify visual polish:**
   - No layout shifts on load
   - Loading states display correctly
   - Error states display correctly
   - Responsive behavior (if applicable)

5. **Include in Phase 5 report:**
   ```
   ### Browser Verification Results
   
   **User Flows:** [X]/[Y] passed
   **Console Errors:** [count] - [details if any]
   **Visual Issues:** [list or "None"]
   ```

**If any issues found:** Fix before marking complete.

---

### STEP 5C: DOCUMENTATION (REQUIRED)

**⚠️ Documentation is NOT optional. Complete this section before presenting checkpoint.**

#### Documentation Routing Rules

**STOP and think:** Where does each piece of information belong?

| Content Type | Goes In | NOT In | Max Size |
|--------------|---------|--------|----------|
| Feature index entry | docs/specs/readme.md (The Pin) | — | 1 table row |
| New module location | docs/specs/readme.md Source Code Index | — | 1 table row |
| User-facing change description | CHANGELOG.md | — | 1-2 sentences |
| Feature exists (just the name) | ARCHITECTURE.md Feature Index | — | 1 table row |
| Implementation details, function tables | docs/architecture/features.md | ARCHITECTURE.md | Unlimited |
| Domain rules (RBAC, reports, etc.) | .claude/rules/*.md | ARCHITECTURE.md | As needed |
| Quick reference (new commands, concepts) | CLAUDE.md | — | Only if essential |
| Session state | progress.md | — | Fixed structure |
| Feature tracking | feature_list.json | — | Update status |
| Acceptance criteria completion | docs/specs/[feature].spec | — | Mark [x] on verified ACs |

**Anti-Bloat Rules:**
- **ARCHITECTURE.md** stays under ~300 lines. If adding >10 lines → wrong place
- **CLAUDE.md** rarely changes. If adding >5 lines → probably wrong place
- Database/ORM function tables → **docs/architecture/features.md** (NEVER ARCHITECTURE.md)
- Detailed flows/diagrams → **docs/architecture/features.md** (NEVER ARCHITECTURE.md)

#### Documentation Checklist

Go through EACH item. Mark what you updated:

**1. docs/specs/readme.md (The Pin)** (ALWAYS)
- [ ] Added feature to Feature Specs table with ✅ status
- [ ] Added new modules to Source Code Index (if any created)
- [ ] Updated Concept Index (if new concepts introduced)

**2. docs/specs/[feature].spec** (ALWAYS)
- [ ] Marked all verified acceptance criteria as `[x]` complete
- [ ] Spec file now shows which ACs were met

**3. CHANGELOG.md** (ALWAYS)
```bash
# Verify entry exists
grep -A2 "\[Unreleased\]" CHANGELOG.md | head -5
```
- [ ] Added entry under [Unreleased] → Added/Changed/Fixed section

**4. feature_list.json** (ALWAYS)
- [ ] Updated status to "complete"
- [ ] Set phase_completed to 5
- [ ] Added completed_at timestamp
- [ ] Added tests_added count

**5. progress.md** (ALWAYS)
- [ ] Replaced "Current Feature" section (now empty)
- [ ] Updated "Last Completed" with this feature
- [ ] Updated "Project State" with test count

**6. ARCHITECTURE.md** (IF new feature)
- [ ] Added ONE ROW to Feature Index table
- [ ] Did NOT add implementation details (those go to features.md)
- [ ] Kept file under 300 lines

**7. docs/architecture/features.md** (IF implementation details needed)
- [ ] Added implementation section with function tables, flows, etc.
- [ ] This is where detailed documentation belongs

**8. .claude/rules/*.md** (IF domain rules changed)
- [ ] Updated rbac.md if auth/permissions changed
- [ ] Updated report-schema.md if report handling changed
- [ ] Created new rule file if new domain introduced

**9. CLAUDE.md** (RARELY - only if essential)
- [ ] Only updated if new core concept or command added
- [ ] Kept changes minimal (<5 lines)

---

### STEP 5D: Phase 5 Verification Gate

**🔄 VERIFICATION GATE - Auto-verify via `phase-gate.sh` hook**

The hook checks: Tests pass, build succeeds, CHANGELOG updated, feature_list.json updated, **document indexes updated**.

> For full gate script: `cat .claude/REFERENCE.md` (Phase 5 Gate Checks section)

#### Documentation Index Verification (REQUIRED)

**Before proceeding, verify all indexes are updated:**

```bash
# 1. Specs index has feature with ✅
grep "[FEATURE_ID].*✅" docs/specs/readme.md || echo "FAIL: Specs index missing"

# 2. Source Code Index has new modules (if any created)
# Check manually - did you create new .ts files?

# 3. ARCHITECTURE.md Feature Index has entry
grep "[FEATURE_ID]" ARCHITECTURE.md || echo "FAIL: Architecture index missing"

# 4. feature_list.json shows complete
grep -A2 '"[FEATURE_ID]"' feature_list.json | grep '"complete"' || echo "FAIL: feature_list not updated"
```

**If any check fails → fix before proceeding.** These indexes enable future context loading.

Update progress.md: `**Gate Status:** pending` to trigger hook.

---

### PHASE 5 COMPLETE

**🔄 VERIFICATION GATE PASSED** - Announce: "✅ Feature complete"

> Escalation template: `cat .claude/REFERENCE.md` (Escalation Template section)

---

### STEP 5E: Phase 5 Commit

**On Gate Pass - Final Commit:**

```bash
git add -A
git commit -m "verify: complete [feature]

- Spec compliance: [X]/[X] criteria
- Tests: [X] passing
- Changelog: updated
- Phase 4 gate: PASSED
- Phase 5 gate: PASSED"
```

Update feature_list.json:
```json
{
  "status": "complete",
  "phase_completed": 5,
  "completed_at": "[timestamp]",
  "tests_added": [count]
}
```

**REPLACE** progress.md entirely with this fixed structure:
```markdown
# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** [feature-id]
**Date:** [date]

[Brief description of what was built]

**Files Created:**
- [list key files]

**Files Modified:**
- [list key files]

**Key Implementation:**
- [key point 1]
- [key point 2]

**Spec:** `docs/specs/[feature].spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** [X] passing
- **Build:** ✅ succeeds
- **Features:** [X] complete
```

This moves the completed feature to "Last Completed" and clears "Current Feature" for the next build.

---

## DONE

**V9.2 Completion Summary:**

```markdown
## ✅ Feature Build Complete

### Human Approvals (3 Decision Gates)
1. ✅ Phase 1: Spec approved
2. ✅ Phase 2: Visual design approved
3. ✅ Phase 3: Data model approved

### Automated Verification (2 Verification Gates)
4. ✅ Phase 4 Gate: TDD proven, tests pass, no mock data
5. ✅ Phase 5 Gate: Build succeeds, docs updated

### Summary
- **Feature:** [description]
- **User:** [who, device, primary goal]
- **Tests added:** [count]
- **Spec compliance:** [X]/[X] criteria
- **Total time:** [Phases 4-5 ran autonomously]
```

**The feature is complete when:**

| Checkpoint | Type | Status |
|------------|------|--------|
| Phase 1: Spec approved | 🛑 DECISION | Human approved |
| Phase 2: Design approved | 🛑 DECISION | Human approved |
| Phase 3: Data model approved | 🛑 DECISION | Human approved |
| Phase 4: TDD + implementation | 🔄 VERIFICATION | Auto-verified |
| Phase 5: Verification + docs | 🔄 VERIFICATION | Auto-verified |
| CHANGELOG.md updated | 🔄 VERIFICATION | Auto-verified |
| feature_list.json complete | 🔄 VERIFICATION | Auto-verified |
| Git commits for each phase | 🔄 VERIFICATION | Auto-verified |
