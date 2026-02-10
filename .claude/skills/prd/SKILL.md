---
name: prd
description: Use when creating comprehensive Product Requirement Documents for complex multi-phase features that spawn multiple child features.
argument-hint: "[feature-name or area]"
---

# PRD Skill

## Overview

Create comprehensive Product Requirement Documents for complex features. PRDs are **strategic documents** that spawn **multiple child features**, each built with `/build`.

```
PRD (Strategic)          Spec (Tactical)
├─ Vision & architecture  ├─ Single buildable feature
├─ Schema changes         ├─ User flows & ACs
├─ Multiple phases        ├─ One spec per /build
└─ Spawns child specs     └─ References parent PRD
```

**Key Concept:** PRD → spawns child features → each child built with `/build`

## How Product Strategists Think

**"What's the smallest version that proves the idea?"**
Amateurs write 50-page PRDs covering every edge case. Experts define the minimum viable scope that validates the core hypothesis. The PRD exists to align a team on what to build FIRST, not to document everything forever.

**"What decisions can't be reversed?"**
Not all decisions are equal. Schema changes are expensive to reverse. UI layouts are cheap. A good PRD identifies the one-way doors and gets those right. Everything else can iterate.

**"Who will read this, and what do they need?"**
The Context Summary exists for `/build` to consume. The rest exists for humans to align on. Write for both audiences — machine-readable context at the top, human-readable decisions below.

### What Separates Amateurs from Professionals

| Amateur | Professional |
|---------|--------------|
| Writes PRD to document everything | Writes PRD to align on decisions |
| 50-page novel nobody reads | Scannable sections with clear decisions |
| Starts coding, PRD is afterthought | PRD BEFORE code — architecture decisions first |
| No child feature breakdown | Clear decomposition into buildable units |
| Vague "make it better" goals | Observable, testable acceptance criteria |

When you catch yourself writing a PRD without concrete acceptance criteria or without decomposing into child features — STOP. Those are the two things that make a PRD actionable.

## When to Use /prd

| Use /prd | Use /build directly |
|----------|---------------------|
| Multiple child features | Single feature |
| Schema/database changes | UI-only changes |
| Architecture decisions | No new tables/models |
| Multi-phase rollout | Ships in one phase |
| > 1 week of work | < 1 week of work |

- **NOT** for bug fixes (use /fix)
- **NOT** for small changes (use /quick)

## The PRD Creation Process

### Step 1: Understand the Problem

Before writing anything, understand:

| Question | What You Learn |
|----------|---------------|
| What's the user pain? | Why this feature matters |
| Who specifically uses this? | Design constraints |
| What's the current behavior? | What needs to change |
| What's the desired state? | Success criteria |

### Step 2: Check for Conflicts

Before creating a PRD, check existing PRDs and pending features:

```bash
# List existing PRDs
ls docs/prds/

# Check feature_list.json for pending work
cat feature_list.json | grep -A5 '"pending_features"'
```

Ensure your feature doesn't conflict with or depend on pending work.

### Step 3: Create the PRD

Create file at: `docs/prds/[PRD_ID]-[name].md`

**CRITICAL: Context Summary Section**

The **Context Summary** section at the top is **required**. This is what `/build` loads when building child features. Keep it under 50 lines.

```markdown
# PRD: [Feature Name]

> **ID:** [PRD_ID]
> **Status:** Draft | In Progress | Complete
> **Author:** [Author]
> **Created:** [Date]
> **Last Updated:** [Date]

---

## Context Summary
<!-- ⚠️ REQUIRED: This section is loaded by /build for child features. Keep under 50 lines. -->

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

## User Context

### Who Uses This?
[Table: Persona | Role | Context]

### Top 3 Goals
[Numbered list]

### Mental Model
[How users think about this]

### Glance Questions
[What users need to know immediately]

---

## Executive Summary
[2-3 paragraphs: What, Why, Before/After]

---

## Problem Statement

### The [Problem Type] Problem
[Describe the pain point with concrete examples]

### Root Cause
[Why this problem exists]

### User Impact
[Table showing impact per persona]

---

## Vision: [Descriptive Title]
[How this feature solves the problem]

---

## Feature Outline (Approved)

### What Changes
[Table: Component | Current | New]

### Key Flows
[Numbered list with step-by-step]

### Out of Scope (This Build)
[Explicit exclusions]

### Relationship to Other Features
[Table showing how this relates to existing features]

---

## Architecture
[Diagrams, before/after flows]

---

## Schema Changes
[Table definitions, new fields, indexes]

---

## Data Flow
[Step-by-step data movement, pseudocode]

---

## Edge Cases & Error Handling
[Table for each edge case: Scenario | Problem | Risk | Solution]

---

## File Changes

### New Files
[Table: File | Purpose]

### Modified Files
[Table: File | Changes]

---

## Implementation Phases
[Phased approach with checkboxes]

---

## Acceptance Criteria (Testable)
[Checkboxes with observable, testable criteria]

---

## Success Definition
[Observable outcomes that prove it works]

---

## Cost Impact
[If applicable: API calls, tokens, etc.]

---

## Risks & Mitigations
[Table: Risk | Likelihood | Impact | Mitigation]

---

## Decision Log
[Table: Date | Decision | Rationale]

---

## Appendix
[Examples, templates, additional detail]
```

### Step 4: Update feature_list.json

After PRD approval, add feature(s) to `feature_list.json`:

1. Update `pending_features.count` and `pending_features.ids`
2. Add feature entries to `features` array with:
   - `id`: Feature ID (e.g., "F027-001")
   - `name`: Short name
   - `type`: "backend" or "frontend"
   - `priority`: 1-3
   - `status`: "pending"
   - `current_phase`: 0
   - `prd_file`: Path to PRD
   - `prd_context`: { read_sections, key_concepts }
   - `description`: One sentence
   - `dependencies`: Array of feature IDs
   - `files_to_create` / `files_to_modify`: Arrays
   - `subtasks`: Array of implementation steps
   - `acceptance_criteria`: Testable criteria

3. Add implementation sequence (e.g., `f027_implementation_sequence`)

### Step 5: Confirm with User

Present summary:

```
## PRD Created: FXXX - Feature Name

**File:** docs/prds/feature-fXXX-name.md

**Implementation breakdown:**
- FXXX-001: [Name] - [Description]
- FXXX-002: [Name] - [Description]
- ...

**Dependencies:** [List]

**Ready to build after:** [Blocking features]

Run `/build FXXX-001` to start implementation.
```

## Feature ID Conventions

- Main features: F001, F002, ..., F027
- Sub-features: F027-001, F027-002, ...
- RBAC features: RBAC-001, RBAC-002, ...

## PRD Quality Checklist

- [ ] User context captured (who, device, goals, mental model)
- [ ] Problem clearly stated with concrete examples
- [ ] Before/after comparison included
- [ ] Architecture documented with diagrams/flows
- [ ] Schema changes fully specified
- [ ] All edge cases identified (aim for 10+)
- [ ] Implementation phases defined
- [ ] Acceptance criteria are observable/testable
- [ ] Dependencies listed and checked for conflicts
- [ ] feature_list.json updated
- [ ] No conflicts with pending features

## Common Mistakes

| ❌ Wrong | ✅ Right |
|----------|----------|
| Vague acceptance criteria | Observable, testable criteria |
| Missing edge cases | 10+ edge cases documented |
| No schema details | Exact field definitions |
| Conflicting with pending work | Check dependencies first |
| Implementation details in PRD | Architecture yes, code no |
| Skipping feature_list.json | Always update after PRD |

## Exit Criteria

- [ ] PRD created in `docs/prds/`
- [ ] Follows standard structure
- [ ] No conflicts with existing/pending features
- [ ] Feature entries added to `feature_list.json`
- [ ] Implementation sequence defined
- [ ] User confirmed ready to build

**Done when:** PRD is approved and implementation can begin with `/build FXXX-001`.
