---
name: implementation-plan
description: Use after spec is approved, before writing code, or when a feature feels overwhelming. Breaks complex work into shippable chunks.
---

# Implementation Plan Skill

## Overview

An implementation plan turns a daunting feature into a series of small wins. Each task should be shippable—something you could deploy, demo, or checkpoint. If you can't ship it, it's too big.

## How Tech Leads Think

**"What can we ship today?"**
Big features don't ship—small increments do. Break everything into pieces that could go to production independently. Each piece proves progress. Each piece reduces risk. Ship early, ship often.

**"What are the dependencies?"**
Some tasks block others. Some need external verification first. Some can happen in parallel. Map the dependency graph before you start, or you'll discover blockers mid-stream.

**"Where are the dragons?"**
Every project has risky parts—unknowns, new integrations, untested assumptions. Identify them early. Attack them first. Don't save the scary stuff for the end when you're out of time.

### What Separates Amateurs from Professionals

Amateurs plan tasks in the order they think of them.
Professionals plan tasks in the order that reduces risk and enables shipping.

The amateur thinks: "I'll build the backend, then the frontend, then test."
The professional thinks: "What's the riskiest assumption? Let me validate that first. What can I ship to get feedback?"

When catching yourself with a task list that's just "build all the things"—STOP. Find the order that reduces risk and enables incremental shipping.

## When to Use

- After spec is approved, before writing code
- When a feature feels overwhelming
- When you're not sure where to start
- When coordinating multiple components
- **NOT** for simple, single-task work
- **NOT** for exploration (use brainstorm skill)

## The Planning Process

### Step 1: Identify the Pieces

Break the feature into components:

```markdown
## Feature: Project Budget Tracking

### Components
- [ ] UI: Budget display on project cards
- [ ] UI: Budget edit form
- [ ] UI: Over-budget warning indicator
- [ ] API: Budget CRUD endpoints
- [ ] Data: Budget field on project model
- [ ] Logic: Over-budget calculation
- [ ] Tests: Unit + integration
```

### Step 2: Map Dependencies

What blocks what?

```
Data Model ──► API Endpoints ──► UI Integration
                    │
                    ▼
              Business Logic
                    │
                    ▼
                  Tests
```

### Step 3: Order for Risk Reduction

**Frontend-first** for most features:
1. UI with mock data → Get visual feedback fast
2. Data model → Foundation for everything
3. API endpoints → Connect the layers
4. Integration → Wire UI to real data
5. Polish → Edge cases, error handling

**Backend-first** when:
- Complex business logic needs validation
- External API integration is the risk
- Data migration is involved

### Step 4: Size the Tasks

| Size | Time | Scope | Example |
|------|------|-------|---------|
| ✅ Right | 15-60 min | One concern, one commit | "Add budget field to project form" |
| ❌ Too big | 2+ hours | Multiple concerns | "Build budget tracking" |
| ❌ Too small | < 10 min | Trivial | "Add import statement" |

**Test:** Can you describe what changes in one sentence? That's the right size.

### Step 5: Create the Plan

```markdown
## Implementation Plan: [Feature Name]

### Tasks (in order)

**Phase 1: Visual Foundation**
1. [ ] Create BudgetBadge component with mock data
2. [ ] Add budget display to ProjectCard
3. [ ] Create BudgetEditForm component
4. [ ] Add over-budget warning styling

**Phase 2: Data Layer**
5. [ ] Add budget field to Project model
6. [ ] Create migration for existing projects
7. [ ] Add budget validation (positive, max value)

**Phase 3: API**
8. [ ] Add budget to create project endpoint
9. [ ] Add budget to update project endpoint
10. [ ] Add over-budget filter to list endpoint

**Phase 4: Integration**
11. [ ] Wire ProjectCard to real budget data
12. [ ] Wire BudgetEditForm to API
13. [ ] Add loading/error states

**Phase 5: Polish**
14. [ ] Add unit tests for budget logic
15. [ ] Add integration tests for budget flow
16. [ ] Handle edge cases (0 budget, very large)

### Dependencies
- [ ] Verify: User auth is working (needed for API)
- [ ] External: None

### Risks
- **Risk:** Large budgets might overflow number display
  **Mitigation:** Use currency formatting, test with large values early
  
- **Risk:** Existing projects have no budget
  **Mitigation:** Default to null, handle gracefully in UI

### Checkpoints
- After Phase 1: Demo UI to stakeholder
- After Phase 3: Integration test passes
- After Phase 5: Ready for launch
```

## Task Patterns

### UI Task
```markdown
[ ] Create [Component] with [states]
    - Props: [list key props]
    - States: default, loading, empty, error
    - Mock data for now
```

### API Task
```markdown
[ ] Add [METHOD /path] endpoint
    - Request: [shape]
    - Response: [shape]
    - Validation: [rules]
    - Errors: [codes]
```

### Integration Task
```markdown
[ ] Wire [Component] to [API/data]
    - Replace mock with real data
    - Handle loading state
    - Handle error state
```

### Test Task
```markdown
[ ] Add tests for [scope]
    - Unit: [specific functions]
    - Integration: [specific flows]
    - Edge cases: [list them]
```

## Dependency Patterns

| Dependency Type | How to Handle |
|----------------|---------------|
| External API | Verify before building integration |
| Auth/permissions | Ensure working before protected features |
| Data migration | Plan rollback strategy |
| Third-party SDK | Spike integration first |
| Design approval | Get sign-off before polish phase |

## Risk Patterns

| Risk Type | Mitigation |
|-----------|------------|
| Unknown integration | Spike it first, before dependent work |
| Performance concern | Build benchmark test early |
| Complex calculation | TDD the logic in isolation |
| Data migration | Write reversible migration |
| External dependency | Have fallback plan |

## Quick Reference

| Situation | Planning Approach |
|-----------|------------------|
| New feature | Frontend-first, risk-first |
| Bug fix | Reproduce → test → fix → verify |
| Refactor | Tests first → change → verify |
| Integration | Verify external first → build |
| Migration | Backup → migrate → verify → cleanup |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| "Build the feature" as one task | Break into 10-15 small tasks | Can't track progress on vague tasks |
| Backend first always | Frontend first when visual feedback helps | Early feedback reduces rework |
| Saving risks for the end | Attack risky parts early | Discover blockers when you have time |
| No checkpoints | Define demo/review points | Stakeholders need visibility |
| Dependencies implicit | Dependencies explicit | Prevent mid-stream blockers |

## Exit Criteria

- [ ] All tasks listed in dependency order
- [ ] Each task is 15-60 minutes, one commit
- [ ] Dependencies identified and ordered correctly
- [ ] Risks documented with mitigations
- [ ] Checkpoints defined for visibility
- [ ] Risky parts scheduled early
- [ ] Ready to start executing

**Done when:** You could hand this plan to another developer and they'd know exactly what to do, in what order, and what to watch out for.
