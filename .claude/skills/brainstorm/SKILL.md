---
name: brainstorm
description: Use when ideas are vague, starting a new project, or when "I want something like..." needs exploration before specification.
---

# Brainstorm Skill

## Overview

Brainstorming is divergence before convergence. First expand the possibility space—what could this be? Then narrow down—what should it be? Jumping to solutions before exploring the problem is how you build the wrong thing well.

## How Product Strategists Think

**"What problem are we actually solving?"**
Features are solutions. Before discussing solutions, understand the problem. "I need a dashboard" is a solution. "I can't tell what's urgent" is a problem. Solve problems, not feature requests.

**"What if we didn't build anything?"**
The best feature is often no feature. Could this be solved with a spreadsheet? An existing tool? A process change? Sometimes the answer is yes—and that's valuable to discover early.

**"What's the smallest thing that would matter?"**
Big visions are easy. Shipping is hard. What's the tiniest version that delivers real value? If you can't identify it, you don't understand the problem well enough.

### What Separates Amateurs from Professionals

Amateurs start with solutions and work backwards to justify them.
Professionals start with problems and explore multiple solutions.

The amateur thinks: "They want a calendar view, let me build a calendar."
The professional thinks: "Why do they want a calendar? What problem does it solve? Are there other ways to solve that?"

When catching yourself jumping to "how to build it" before understanding "why build it"—STOP. You're skipping the most important part.

## When to Use

- User describes a vague idea ("I want something like...")
- Starting a greenfield project
- Feature request that feels like a solution, not a problem
- Exploring feasibility of an idea
- **NOT** for well-defined specifications (use spec skill)
- **NOT** for implementation details (use build command)

## The Diverge-Converge Process

### Phase 1: Diverge (Expand Possibilities)

**Don't narrow yet.** Explore the space.

**Problem Exploration:**
- What's the pain point in their words?
- What triggered this idea?
- What are they doing today without this?
- What happens if this problem isn't solved?

**"What If" Questions:**
- What if this was 10x simpler?
- What if we solved only the most painful part?
- What if this existed for a different user?
- What if we combined this with something else?
- What if we built the opposite?

**Alternative Solutions:**
- What existing tools solve adjacent problems?
- How do competitors approach this?
- What's the manual workaround today?
- Could a simpler tool work?

### Phase 2: Converge (Narrow to Action)

**Now narrow.** Make decisions.

**The Killer Questions:**

| Question | What It Reveals |
|----------|-----------------|
| What problem does this solve? | Is it worth solving? |
| Who specifically has this problem? | Is there a real user? |
| What's the simplest version that matters? | What's the MVP? |
| What's the riskiest assumption? | What could kill this? |
| Why hasn't this been solved already? | What's hard about it? |

### Phase 3: Structure the Output

After exploration, produce clarity:

```markdown
## Brainstorm Output: [Idea Name]

### Problem Statement
[One sentence: Who has what problem, and why does it matter?]

### Target User
- **Who:** [Specific person/role]
- **Context:** [When/where they have this problem]
- **Current Solution:** [What they do today]

### MVP Scope
The smallest version that delivers value:
1. [Core feature 1]
2. [Core feature 2]
3. [Core feature 3]

### Out of Scope (for now)
- [Feature that's nice but not essential]
- [Feature that adds complexity]

### Riskiest Assumption
[What must be true for this to work? How could we test it?]

### Open Questions
- [Unresolved question 1]
- [Unresolved question 2]

### Recommended Next Step
[ ] Ready for /build - proceed to spec
[ ] Need research - [what to investigate]
[ ] Need user input - [questions to ask]
[ ] Kill it - [why this isn't worth building]
```

## Facilitation Techniques

### The "5 Whys"
Keep asking "why" until you hit the root problem:
- "I need a calendar view" → Why?
- "To see what's scheduled" → Why is that hard now?
- "Tasks are scattered across screens" → Why?
- "We added features over time without planning" → Why does that matter?
- "I miss deadlines because I can't see everything" → **Root problem: visibility into deadlines**

### The "10x Simpler" Test
Force simplicity by asking: "If we could only build 10% of this, what would it be?"

### The "Magic Wand" Question
"If you had a magic wand and this problem was solved tomorrow, what would be different?"
This reveals the desired outcome, not the assumed solution.

### The "Newspaper Test"
"If this succeeded wildly, what would the headline say?"
This clarifies what success actually looks like.

## Red Flags During Brainstorming

| Red Flag | What It Means | Action |
|----------|---------------|--------|
| Can't articulate the problem | Solution looking for a problem | Dig deeper on pain points |
| "Everyone" needs this | No specific user in mind | Narrow to one user type |
| Scope keeps growing | Unclear priorities | Force MVP constraints |
| No existing alternatives | Either very innovative or not a real problem | Investigate why |
| "Just build it and see" | Avoiding hard thinking | Push for clarity first |

## Quick Reference

| Situation | Brainstorm Action |
|-----------|------------------|
| Vague idea | Problem exploration → 5 Whys |
| Feature request | "What problem does this solve?" |
| Big vision | "What's the 10x simpler version?" |
| Unclear user | "Who specifically has this problem?" |
| Scope creep | "What's the MVP that matters?" |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Jumping to solutions | Exploring the problem first | Solutions without problems are waste |
| "Users want X" | "User Y has problem Z" | Vague users = vague solutions |
| Building everything | Defining MVP scope | Ship something, learn, iterate |
| Ignoring alternatives | Considering existing solutions | Maybe you don't need to build |
| Endless exploration | Time-boxed divergence → convergence | Brainstorming should produce decisions |

## Exit Criteria

- [ ] Problem clearly articulated (not just a feature request)
- [ ] Specific user identified (not "everyone")
- [ ] MVP scope defined (3-5 core features max)
- [ ] Riskiest assumption identified
- [ ] Open questions documented
- [ ] Clear next step recommended

**Done when:** You could explain to a stranger what you're building, who it's for, and why it matters—in 30 seconds.
