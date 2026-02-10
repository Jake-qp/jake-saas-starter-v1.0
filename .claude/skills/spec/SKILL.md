---
name: spec
description: Use when starting any new feature, capturing requirements, or when user describes what they want to build. Before any design or code work begins.
---

# Spec Skill

## Overview

A spec is an alignment tool, not a document. The goal is shared understanding between you and the user—catching wrong assumptions before a single line of code exists.

## How Product Experts Think

**"Who is the human, really?"**
Features don't exist in a vacuum. Before asking what to build, understand who's using it, when, where, and why. A dashboard for a busy construction owner checking his phone between job sites is fundamentally different from a dashboard for an analyst at a desk with three monitors.

**"What's the burning problem—not the feature request?"**
Users ask for features. Experts dig for problems. "I need a calendar view" might mean "I can't see what's coming up" or "I'm missing deadlines" or "I need to block time." The feature request is a guess at a solution. Find the problem.

**"How will we know this worked?"**
If you can't observe success, you can't build toward it. "Budget tracking works" is useless. "User can see which projects are over budget at a glance without clicking into each one" is testable.

### What Separates Amateurs from Professionals

Amateurs write feature lists. Professionals create shared mental models.

The amateur asks: "What features do you want?"
The professional asks: "Walk me through your Tuesday. Where does it hurt?"

When catching yourself listing features without understanding the human—STOP. You're building the wrong thing.

## When to Use

- User describes a new feature or app they want
- Starting Phase 1 of any build
- Requirements feel vague or ambiguous
- Scope needs explicit boundaries
- **NOT** for bug fixes (use debugging skill)
- **NOT** for technical refactors (use refactor command)

## The Alignment Sequence

### Step 1: Understand the Human

Ask these questions. Don't skip them.

| Question | What You're Really Learning |
|----------|----------------------------|
| Who specifically uses this? | Language, complexity, assumptions you can make |
| What device/context? | Mobile means bigger targets, offline matters, interruptions happen |
| What are their top 3 goals? | What goes above the fold, what's buried in menus |
| What's their mental model? | The words they use, how they organize information |
| What must they know at a glance? | The dashboard question—what's the first thing they see? |

**Get specific.** Not "a user" but "Pete, owner of a 15-person electrical company, checking his phone between job sites, needs to know if anything's on fire."

### Step 2: Present the Feature Outline (CHECKPOINT)

Before any acceptance criteria, show the user exactly what you're planning to build.

```markdown
## 📋 Proposed Feature Outline

Based on [User]'s goals, here's what I'm planning:

### Screens
1. **[Screen]** - [Purpose and why it matters to this user]
2. **[Screen]** - [Purpose]
3. **[Screen]** - [Purpose]

### Key Flows
1. **[Flow]:** [User] opens app → [steps] → [outcome]
2. **[Flow]:** [User] wants to [goal] → [steps] → [outcome]

### Out of Scope (this build)
- [Explicitly not building]
- [Explicitly not building]

---
**Does this match what you're envisioning?**
✅ Looks good → ➕ Add something → ➖ Remove something → 🔄 Change something
```

**Do not proceed until the user confirms.** This is where misalignment dies—before you've written any code.

### Outline Modification Rules (V8.4)

**After ANY modification to the outline, you MUST re-confirm:**

| User Response | Your Action |
|---------------|-------------|
| "Looks good" (no changes) | ✅ Proceed to acceptance criteria |
| Adds/removes/changes features | Update outline, then **RE-CONFIRM before proceeding** |
| Asks clarifying questions | Answer, then re-present outline |

**The re-confirm sequence:**

1. User requests a change: "Also add a Preferred flag"
2. You update the outline
3. You show the updated outline
4. You ask: **"Does this updated outline look right?"**
5. You WAIT for explicit approval
6. Only then proceed to acceptance criteria

**⚠️ DO NOT assume "yes, but add X" means "go ahead and build."** The user may want to review the updated outline before committing.

```
# WRONG
User: "Yes, but also add a Preferred flag"
Claude: "Got it! Adding that..." [shows outline] "Proceeding to build..."

# CORRECT  
User: "Yes, but also add a Preferred flag"
Claude: "Got it! Adding that..." [shows outline] "Does this updated outline look right?"
User: "Yes, let's build it"
Claude: "Perfect, proceeding to acceptance criteria..."
```

### Step 3: Write Testable Acceptance Criteria

Every criterion must be observable. Apply this test: "Could I watch someone use this and verify it works?"

| ❌ Untestable | ✅ Testable |
|--------------|-------------|
| Budget tracking works | User sees a red indicator on projects exceeding budget without clicking into them |
| Fast loading | Dashboard loads in under 2 seconds on 3G connection |
| Easy to use | New user completes first task without asking for help |
| Notes feature exists | User can add a note without leaving the current screen |

### Step 4: Check for CRUD Gaps

For each entity in the outline, explicitly confirm operations:

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Project | ✅ | ✅ | ✅ | ❌ Archive only | Hard delete too risky |
| Task | ✅ | ✅ | ✅ | ✅ | Undo for 30 seconds |

**Common gaps that burn you later:**
- Create without Delete → How do users fix mistakes?
- Read without Update → Stuck with typos forever?
- Delete without Undo → One click destroys data?

### Step 5: Feature Discovery Prompt

After outline approval, surface common requirements:

> "For this type of app, you'll typically want some of these. Which should we include?"
> - [ ] User authentication
> - [ ] Save data between sessions  
> - [ ] Mobile responsive
> - [ ] Offline capability
> - [ ] Search/filtering
> - [ ] Export (PDF, CSV)
> 
> "Anything else I'm missing?"

Confirmed items → Acceptance criteria. Declined items → Out of Scope.

## The Spec Artifact

Create `docs/specs/[feature].spec` with this structure:

```markdown
# Feature: [Name]

## User Context
- **Who:** [Specific person and role]
- **Context:** [Device, environment, constraints]
- **Goals:** [Top 3, priority order]
- **Mental Model:** [How they think about this domain]
- **Glance Questions:** [What they need to know immediately]

## Feature Outline (Approved)
### Screens
[Numbered list with purpose]

### Key Flows  
[Numbered list with steps]

### Out of Scope
[Explicit exclusions]

## Acceptance Criteria
- [ ] [Observable, testable criterion]
- [ ] [Observable, testable criterion]

## Edge Cases
- [Situation]: [Expected behavior]

## Success Definition
We'll know this works when: [Observable outcome]
```

## Iterative Builds

If a `.spec` already exists in `docs/specs/`:

1. Read it first
2. Present additions as a delta: "Your current app has X. I'm proposing to add Y."
3. Get approval before modifying
4. Update the spec with approved changes

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| "A user wants to track budgets" | "Pete, who runs 5 concurrent projects, needs to spot budget problems before his weekly client calls" | Specificity drives design decisions |
| Listing features before understanding context | User context first, always | Features without context are guesses |
| "Budget tracking works" | "Over-budget projects show red badge visible from list view" | Untestable criteria are useless |
| Proceeding without outline approval | Explicit "does this match?" checkpoint | Misalignment costs 10x more after building |
| Assuming CRUD completeness | Explicit operation confirmation per entity | Missing delete/undo burns you at launch |

## Phase 1 Boundaries

In Phase 1, you create ONLY the spec:
- ❌ No code
- ❌ No designs
- ❌ No components
- ✅ Only the specification with user context and approved outline

## Exit Criteria

- [ ] User context captured (who, device, goals, mental model, glance questions)
- [ ] Feature Outline presented and explicitly approved
- [ ] Screens and flows documented
- [ ] Out of Scope documented
- [ ] All acceptance criteria are observable/testable
- [ ] CRUD operations confirmed per entity
- [ ] Edge cases identified
- [ ] `.spec` file created in `docs/specs/`
- [ ] Ready for Phase 2

**Done when:** You and the user see the exact same thing in your heads. No surprises later.
