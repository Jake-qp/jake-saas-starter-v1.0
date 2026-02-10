---
name: skill-creator
description: Use when creating a new skill, enhancing an existing skill, or documenting reusable expertise. Not for one-off solutions or project-specific conventions.
argument-hint: "[skill-name or topic]"
allowed-tools: Read, Grep, Glob, Write, Edit, WebFetch, WebSearch
---

# Skill Creator

## Overview

Creating effective skills requires two things: **expert content** (making Claude *think* like a domain expert) and **sound architecture** (using the right Claude Code capabilities for the job). Most skills fail at one or both. This skill teaches you to nail both.

## How Skill Authors Think

**"What does Claude fail at without this skill?"**
Unable to point to a specific failure? Then a skill isn't needed. Watch Claude fail first.

**"Who is the world-class expert in this domain?"**
An effective skill cannot be written from the outside. Adopt the persona of someone who has mastered this domain.

**"What rationalizations will Claude use to skip this?"**
Anticipate shortcuts and close them explicitly. Smart agents find loopholes.

**"What Claude Code capabilities does this skill need?"**
A prompt-only skill is sometimes right. But skills that need arguments, dynamic context, isolation, or safety checks should use the infrastructure Claude Code provides — not reinvent it.

## The Expert Persona Process (CRITICAL)

Before writing ANY skill, first BECOME the world's best expert in that domain. This is not optional — it's the difference between documentation and expertise transfer.

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

**The skill is then written FROM this designer's perspective** — their voice, their concerns, their mental model.

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

**Rule:** Descriptions are TRIGGER-ONLY. Say WHEN to use it, not HOW it works. Max ~200 characters for best auto-invocation behavior.

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
12. Cross-reference existing skills for patterns

### Phase 5: Architect (NEW — Choose Skill Capabilities)

Before writing content, decide what Claude Code infrastructure the skill needs. Run through the **Capability Decision Framework** below.

13. Walk through each question in the framework
14. For unfamiliar capabilities, read [reference.md](../../../docs/skill-creator-reference/reference.md)
15. Pick the matching archetype from [templates.md](../../../docs/skill-creator-reference/templates.md)
16. Note which supporting files you'll need

### Phase 6: Draft (GREEN)
17. Write skill FROM THE EXPERT'S PERSPECTIVE using the chosen archetype
18. Include proper frontmatter based on Phase 5 decisions
19. Check against 4 Core Truths:
    - [ ] Expertise Transfer?
    - [ ] Flow, Not Friction?
    - [ ] Voice Matches Domain?
    - [ ] Focused?
20. **Voice Test:** Read aloud. Does it sound like a senior expert sharing wisdom, or like documentation?

### Phase 7: Validate
21. Test with pressure scenario — would Claude follow this under time pressure?
22. Find rationalizations and close them explicitly
23. Verify frontmatter fields are correct (no invented fields)
24. Iterate until bulletproof

### Phase 8: Finalize (REFACTOR)
25. Final voice check — would a senior practitioner nod at this?
26. Final architecture check — are capabilities used correctly?
27. Save to `.claude/skills/[name]/SKILL.md` (plus supporting files)

## Capability Decision Framework

Walk through each question. If unsure about a capability, read [reference.md](../../../docs/skill-creator-reference/reference.md) for details.

| Question | If Yes → Do This | If No |
|----------|-------------------|-------|
| Does the skill accept arguments? (e.g., issue number, filename) | Add `argument-hint: "[hint]"`, use `$ARGUMENTS` in content | Skip |
| Should it ONLY run when user explicitly types `/name`? | Add `disable-model-invocation: true` | Default (Claude can auto-invoke) |
| Should ONLY Claude invoke it (not shown in `/` menu)? | Add `user-invocable: false` | Default |
| Should it be read-only or have restricted tools? | Add `allowed-tools: Read, Grep, Glob` (or whatever subset) | Skip (all tools available) |
| Does it need live data injected? (git diff, PR info, etc.) | Use dynamic context injection (see reference.md for syntax) | Skip |
| Is it research/exploration that shouldn't pollute main context? | Add `context: fork` + `agent: Explore` | Skip |
| Is it > 500 lines with reference material? | Split into supporting `.md` files in skill directory | Keep single file |
| Does it need safety checks before tool use? | Add `hooks` in frontmatter | Skip |
| Does it generate artifacts or run analysis scripts? | Add `scripts/` directory with executables | Skip |

**Common combinations:**

- **Simple knowledge skill:** Just `name` + `description`. No extras needed.
- **Parameterized task:** `argument-hint` + `disable-model-invocation: true` + `allowed-tools`
- **Research agent:** `context: fork` + `agent: Explore` + `argument-hint`
- **Safety gate:** `user-invocable: false` + `hooks` + `allowed-tools`

For complete archetypes with full frontmatter, see [templates.md](../../../docs/skill-creator-reference/templates.md).
For real-world examples, see [examples.md](../../../docs/skill-creator-reference/examples.md).

## The Skill Template

Every skill should follow this structure. Choose frontmatter fields from the Capability Decision Framework above.

```markdown
---
name: skill-name-with-hyphens
description: [TRIGGER-ONLY - when to use, not how it works]. Max ~200 chars.
# Add these ONLY if needed (see Capability Decision Framework):
# argument-hint: "[what-args-look-like]"
# disable-model-invocation: true
# user-invocable: false
# allowed-tools: Read, Grep, Glob
# context: fork
# agent: Explore
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
[The gap — what do amateurs do that experts never would?]

When catching yourself doing [amateur behavior] — STOP.

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

| Wrong | Right | Why |
|-------|-------|-----|
| [Amateur pattern] | [Expert pattern] | [Explanation] |

## Exit Criteria
- [ ] [Testable criterion]
- [ ] [Testable criterion]

**Done when:** [Clear statement]
```

## Quick Reference: Skill Quality Checklist

### Content Quality

| Check | Requirement |
|-------|-------------|
| Expert Persona | Adopted world-class expert mindset for domain |
| Description | Trigger-only, ~200 chars, no workflow summary |
| Expert section | Explains HOW experts think (from their POV) |
| Voice | Sounds like practitioner sharing wisdom |
| Common Mistakes | Explicitly forbids bad patterns |
| Exit Criteria | Testable completion conditions |

### Architecture Quality

| Check | Requirement |
|-------|-------------|
| Frontmatter | Only real Claude Code fields (no `version`, `triggers`, `gate_type`) |
| Arguments | `argument-hint` + `$ARGUMENTS` if skill accepts input |
| Tool restrictions | `allowed-tools` set if skill should be constrained |
| Context isolation | `context: fork` for research/exploration skills |
| Dynamic context | Dynamic injection for live data — see reference.md for syntax |
| File size | Under 500 lines, or split into supporting files |
| Supporting files | Referenced from SKILL.md, not duplicated |
| Hooks | Only if safety checks are genuinely needed |

## Common Mistakes

### Content Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| Writing skill before seeing failure | Watch Claude fail first | Otherwise, unclear what to teach |
| Writing without adopting expert persona | BECOME the expert first | Cannot transfer expertise without having it |
| Description summarizes workflow | Description is trigger-only | Claude skips reading full skill |
| Documentation voice | Expert practitioner voice | Expertise requires authentic voice |
| Listing steps only | Explaining how experts think | Steps don't transfer mental models |
| No anti-patterns section | Explicit Common Mistakes | Claude will make them if not forbidden |

### Architecture Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| Inventing frontmatter fields (`version`, `triggers`) | Use only real Claude Code fields | Fake fields are silently ignored |
| Putting everything in one 800-line file | Split into SKILL.md + reference files | Claude loses focus in long files |
| No `argument-hint` when skill needs input | Add `argument-hint: "[hint]"` | Users won't know what to pass |
| Using `context: fork` for guidelines | Only fork for explicit tasks | Forked context can't see conversation |
| No `allowed-tools` on dangerous workflows | Restrict to necessary tools | Prevents accidental side effects |
| Hardcoding data that changes | Use dynamic injection for live data (see reference.md) | Stale data produces wrong results |
| Every skill gets every capability | Use only what's needed | Complexity without benefit |

## Rationalization Blockers

Common rationalizations to reject:

- **"I know this domain well enough"** → Has the WORLD-CLASS expert persona actually been adopted? Not "pretty good" — world-class.
- **"This skill is straightforward, I can skip the persona step"** → That's exactly when documentation gets produced instead of expertise transfer.
- **"I'll add the expert thinking section later"** → No. Write FROM the expert's perspective from the start, or rewrite.
- **"The template is enough"** → The template is structure. The persona is soul. Both required.
- **"It's just a simple skill, it doesn't need frontmatter decisions"** → Even simple skills benefit from asking "does it need arguments? tool restrictions?" Takes 30 seconds.
- **"I'll add hooks/scripts/forking because they're cool"** → Only add capabilities the skill actually needs. Simple is better.

## Supporting Files

This skill includes detailed reference material. Load these when needed:

- **[reference.md](../../../docs/skill-creator-reference/reference.md)** — Complete Claude Code skill capabilities documentation (frontmatter fields, dynamic context injection, hooks, scripts, etc.)
- **[templates.md](../../../docs/skill-creator-reference/templates.md)** — Skill archetypes with complete frontmatter examples and skeletons
- **[examples.md](../../../docs/skill-creator-reference/examples.md)** — 5 complete real-world skill examples of different types

## Exit Criteria

- [ ] Watched Claude fail without the skill (RED phase)
- [ ] Adopted world-class expert persona for this domain
- [ ] Walked through Capability Decision Framework
- [ ] Skill follows template structure with correct frontmatter
- [ ] Passes all 4 Core Truths
- [ ] Passes voice test (sounds like expert sharing wisdom)
- [ ] Tested with pressure scenario
- [ ] Rationalizations identified and blocked
- [ ] Only real Claude Code frontmatter fields used
- [ ] Under 500 lines or properly split into supporting files

**Done when:** A senior practitioner in that domain would read the skill and say "yes, that's exactly how I think about it" — AND the skill uses the right Claude Code capabilities for its use case.
