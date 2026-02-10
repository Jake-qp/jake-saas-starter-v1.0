---
name: skill-creator-v2
description: This skill should be used when creating a new skill, enhancing an existing skill, or documenting reusable expertise. Not for one-off solutions or project-specific conventions.
---

# Skill Creator

## Overview

Creating effective skills is TDD for documentation. See Claude fail before knowing what to teach, and BECOME the domain expert before transferring expertise.

## How Skill Authors Think

**"What does Claude fail at without this skill?"** 
Unable to point to a specific failure? Then a skill isn't needed. Watch Claude fail first.

**"Who is the world-class expert in this domain?"**
An effective skill cannot be written from the outside. Adopt the persona of someone who has mastered this domain.

**"What rationalizations will Claude use to skip this?"**
Anticipate shortcuts and close them explicitly. Smart agents find loopholes.

## The Expert Persona Process (CRITICAL)

Before writing ANY skill, first BECOME the world's best expert in that domain. This is not optional—it's the difference between documentation and expertise transfer.

### The 5-Step Persona Process

```
1. ADOPT    → Become the world-class expert in this domain
2. ASK      → "What do I (as this expert) actually care about?"
3. IDENTIFY → "What makes me cringe? What questions do I always ask?"
4. WRITE    → Write the skill FROM that expert's perspective
5. CHECK    → "Would a real senior practitioner nod at this?"
```

### How to Adopt the Persona

For each skill domain, ask yourself:

- **Who is the world's best at this?** (Senior designer at Linear? Security engineer at Stripe? TDD coach who's saved burning codebases?)
- **What have they seen that beginners haven't?** (The failures, the patterns, the hard lessons)
- **What do they notice FIRST?** (Experts see different things than amateurs)
- **What shortcuts make them cringe?** (They've seen those shortcuts fail)
- **What questions do they ALWAYS ask?** (Their mental checklist)

### Example: Adopting the UI Design Persona

**Persona:** Senior designer at Linear/Stripe/Vercel

**What they care about:** Visual hierarchy, breathing room, intentionality, restraint

**What makes them cringe:** Rainbow colors, shadows everywhere, cramped spacing, "looks like a hackathon project"

**Questions they always ask:** "Where does the eye go first? Does every pixel earn its place? Would I pay for this?"

**The skill is then written FROM this designer's perspective**—their voice, their concerns, their mental model.

## The 4 Core Truths

Every skill must pass these checks:

| Truth | What It Means | How to Check |
|-------|---------------|--------------|
| **Expertise Transfer** | Make Claude *think* like an expert, not follow steps | Does the skill explain HOW experts think? |
| **Flow, Not Friction** | Produce output, not intermediate documents | Does it create work product, not ceremony? |
| **Voice Matches Domain** | Sounds like a practitioner, not documentation | Would a senior engineer talk this way? |
| **Focused Beats Comprehensive** | Every section earns its place | Can anything be removed without losing value? |

## The Description Trap (Critical Discovery)

Descriptions containing workflow summaries cause Claude to skip reading the full skill. Claude follows the short description instead of the detailed content.

**BAD:** `description: Use for TDD - write test first, watch it fail, write minimal code, refactor`

**GOOD:** `description: Use when implementing any feature or bugfix, before writing implementation code`

**Rule:** Descriptions are TRIGGER-ONLY. Say WHEN to use it, not HOW it works.

## When to Use This Skill

- Creating a new skill from scratch
- Enhancing an existing skill
- Documenting reusable expertise
- User asks "make a skill for X"
- **NOT** for one-off solutions (put in CLAUDE.md instead)
- **NOT** for standard practices well-documented elsewhere

## Skill Creation Workflow

### Phase 1: Understand
1. What does Claude fail at without this skill?
2. When should this skill activate?
3. Does a similar skill already exist?

### Phase 2: Explore (RED)
4. Test Claude WITHOUT the skill
5. Document the specific failure
6. What knowledge would have prevented it?

**CRITICAL:** No skill without watching Claude fail first. Skipping this step means not knowing what to teach.

### Phase 3: Adopt Expert Persona (REQUIRED)
7. **ADOPT:** Identify and become the world-class expert in this domain
8. **ASK:** What do I (as this expert) actually care about?
9. **IDENTIFY:** What makes me cringe? What questions do I always ask?

An effective skill cannot be written without first becoming the expert. This is not optional.

### Phase 4: Research
10. How do real experts think about this domain?
11. What mental models should transfer?
12. Cross-reference existing skills (Superpowers, Anthropic) for patterns

### Phase 5: Draft (GREEN)
13. Write skill FROM THE EXPERT'S PERSPECTIVE using the template below
14. Check against 4 Core Truths:
    - [ ] Expertise Transfer?
    - [ ] Flow, Not Friction?
    - [ ] Voice Matches Domain?
    - [ ] Focused?
15. **Voice Test:** Read aloud. Does it sound like a senior expert sharing wisdom, or like documentation?

### Phase 6: Validate
16. Test with pressure scenario—would Claude follow this under time pressure?
17. Find rationalizations and close them explicitly
18. Iterate until bulletproof

### Phase 7: Finalize (REFACTOR)
19. Final voice check—would a senior practitioner nod at this?
20. Save to `.claude/skills/[name]/SKILL.md`

## The Skill Template

Every skill should follow this structure:

```markdown
---
name: skill-name-with-hyphens
description: [TRIGGER-ONLY - when to use, not how it works]. Max 400 chars, third person.
---

# Skill Name

## Overview
[1-2 sentences: What is this? Why does it matter?]

## How [Domain] Experts Think

**The [First Key Question]:** "[What experts ask themselves]"
[Why this matters, what it reveals]

**The [Second Key Question]:** "[Another question experts ask]"
[Why this matters]

### What Separates Amateurs from Professionals
[The gap—what do amateurs do that experts never would?]

When catching yourself doing [amateur behavior]—STOP.

## When to Use
- [Trigger condition 1]
- [Trigger condition 2]
- **NOT** for: [Explicit exclusion]

## Quick Reference

| Situation | Action |
|-----------|--------|
| [Common case 1] | [What to do] |
| [Common case 2] | [What to do] |

## Core Workflow

1. **Step 1:** [Action]
2. **Step 2:** [Action]

**Checkpoint:** "[Verification question]"

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| [Amateur pattern] | [Expert pattern] | [Explanation] |

## Exit Criteria
- [ ] [Testable criterion]
- [ ] [Testable criterion]

**Done when:** [Clear statement]
```

## Quick Reference: Skill Quality Checklist

| Check | Requirement |
|-------|-------------|
| Expert Persona | Adopted world-class expert mindset for domain |
| Description | Trigger-only, 200-400 chars, no workflow |
| Expert section | Explains HOW experts think (from their POV) |
| Voice | Sounds like practitioner sharing wisdom |
| Common Mistakes | Explicitly forbids bad patterns |
| Exit Criteria | Testable completion conditions |
| Length | Under 500 lines or split into reference files |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Writing skill before seeing failure | Watch Claude fail first | Otherwise, unclear what to teach |
| Writing without adopting expert persona | BECOME the expert first | Cannot transfer expertise without having it |
| Description summarizes workflow | Description is trigger-only | Claude skips reading full skill |
| Documentation voice | Expert practitioner voice | Expertise requires authentic voice |
| Listing steps only | Explaining how experts think | Steps don't transfer mental models |
| No anti-patterns section | Explicit Common Mistakes | Claude will make them if not forbidden |
| Sounds like a manual | Sounds like wisdom being shared | Manuals don't transfer expertise |

## Rationalization Blockers

Common rationalizations to reject:

- **"I know this domain well enough"** → Has the WORLD-CLASS expert persona actually been adopted? Not "pretty good"—world-class.
- **"This skill is straightforward, I can skip the persona step"** → That's exactly when documentation gets produced instead of expertise transfer.
- **"I'll add the expert thinking section later"** → No. Write FROM the expert's perspective from the start, or rewrite.
- **"The template is enough"** → The template is structure. The persona is soul. Both required.

## Exit Criteria

- [ ] Watched Claude fail without the skill (RED phase)
- [ ] Adopted world-class expert persona for this domain
- [ ] Skill follows template structure
- [ ] Passes all 4 Core Truths
- [ ] Passes voice test (sounds like expert sharing wisdom)
- [ ] Tested with pressure scenario
- [ ] Rationalizations identified and blocked
- [ ] Under 500 lines or properly split

**Done when:** A senior practitioner in that domain would read the skill and say "yes, that's exactly how I think about it."
