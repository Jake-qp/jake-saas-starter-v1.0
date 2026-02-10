---
name: ux
description: Use when designing user flows, information architecture, or when something "feels wrong" but looks fine visually. Spans Phase 1 (context) and Phase 2 (patterns).
---

# UX Skill

## Overview

UX is the path the user walks, not the screens they see. Your job is to remove every obstacle from that path—especially the ones that appear when things go wrong.

## How UX Designers Think

**"What's the user trying to accomplish right now?"**
Not "what feature is this" but "what job are they hiring this screen to do?" A dashboard isn't a dashboard—it's the answer to "what do I need to know right now?" Every screen is a tool for a specific moment.

**"What happens when things go wrong?"**
The happy path is easy. The broken path is where users abandon your product. Empty states, error messages, edge cases—this is where UX is won or lost. If you only designed the sunny day, you haven't designed.

**"How does this match what's already in their head?"**
Users arrive with a mental model. Fight it and they struggle. Match it and the interface disappears. The best UX feels obvious because it mirrors how users already think.

### What Separates Amateurs from Professionals

Amateurs design screens. Professionals design journeys.

The amateur asks: "What should be on this page?"
The professional asks: "What just happened? What are they trying to do? What could go wrong?"

When catching yourself designing a screen without knowing the journey—STOP. You're decorating, not designing.

## When to Use

- Phase 1: Capturing user context and mental models
- Phase 2: Applying patterns to match user needs
- When a flow "feels clunky" but looks fine visually
- When users would need to remember things between screens
- **NOT** for visual polish (use design-system skill)
- **NOT** for code implementation (use frontend skill)

## Phase 1: Understand the Human

### The Five Context Questions

| Question | What You're Really Learning |
|----------|----------------------------|
| Who specifically uses this? | Their vocabulary, patience, expertise |
| What device/context? | Interruptions, screen size, input method |
| What are their top 3 goals? | What goes above the fold |
| What do they need at a glance? | The dashboard question |
| What's their mental model? | How to organize navigation |

### Good vs Bad Context

**✅ Specific:**
```
User: Pete, electrical company owner (15 employees)
Context: Checking phone between job sites, frequently interrupted
Goals: 1. "What's on fire?" 2. "What's due today?" 3. "Quick note without friction"
Mental Model: Projects contain Tasks and Materials. Crew assigned to Tasks.
```

**❌ Useless:**
```
User: Business owner
Context: Uses the app
Goals: Manage projects
```

Useless context creates useless UX. Be specific or start over.

## Phase 2: Design the Journey

### The Journey Framework

For every feature, map:

```
TRIGGER → INTENT → ACTION → FEEDBACK → NEXT
   ↓         ↓        ↓         ↓        ↓
What      What     What do   How do   Where do
prompted  are they  they     they     they go
this?     trying    click?   know it   now?
          to do?             worked?
```

Example:
```
TRIGGER: Pete gets notification "Project X over budget"
INTENT: Understand why, decide what to do
ACTION: Tap notification → Project detail → Budget tab
FEEDBACK: Sees breakdown, red items highlighted
NEXT: Can adjust budget or flag for client call
```

### Information Architecture

| Principle | Implementation |
|-----------|----------------|
| Most important = most prominent | User's #1 goal dominates the screen |
| Group by mental model | Not by database structure |
| Progressive disclosure | Show summary → detail on demand |
| Zero memory required | Never make users remember across screens |

### Navigation Rules

**The 3-Click Test:** Any feature reachable in ≤3 clicks from home.

**Always Answerable:**
- Where am I? (Clear page title, breadcrumbs)
- How did I get here? (Back button, history)
- Where can I go? (Visible navigation)
- How do I get out? (Escape hatch to home)

### Mobile-First Patterns

If user context indicates mobile:

| Pattern | Requirement |
|---------|-------------|
| Tap targets | 44px minimum (thumb-friendly) |
| Primary actions | Bottom of screen (thumb zone) |
| Text input | Minimize—use selection, toggles, defaults |
| Orientation | Design for portrait first |
| Offline | What happens with no connection? |
| Interruptions | User will leave mid-task—save state |

## When Things Go Wrong

This is where you earn your UX.

### Empty States

Every collection needs an empty state:

```
❌ "No items"
✅ "No projects yet. Create your first project to start tracking budgets and tasks."
   [+ Create Project]
```

Empty states should:
- Explain what belongs here
- Guide to the first action
- Feel intentional, not broken

### Error States

```
❌ "Error: 500"
✅ "Couldn't save your changes. Your work is safe—we'll retry automatically."
   [Try Again] [Save Offline]
```

Errors should:
- Explain what happened (in human terms)
- Preserve user's work
- Offer a path forward

### Loading States

| Duration | Treatment |
|----------|-----------|
| < 200ms | No indicator (feels instant) |
| 200ms - 2s | Spinner or skeleton |
| > 2s | Progress indicator with context |
| > 10s | Explanation + option to cancel |

**Rule:** Never block the whole UI if partial data is available.

### Edge Cases Checklist

For every feature, answer:
- What if it's empty?
- What if there's one item?
- What if there are 1,000 items?
- What if the network fails?
- What if they're interrupted mid-task?
- What if they made a mistake?

## UX Patterns Library

### Feedback Loop
Every action needs visible response:
- Tap → ripple/highlight (immediate)
- Submit → loading state (processing)
- Complete → success confirmation (done)
- Fail → error + recovery path (help)

### Undo Over Confirm
```
❌ "Are you sure you want to delete?" [Cancel] [Delete]
✅ *Deletes immediately* "Task deleted" [Undo]
```
Undo is faster and less interruptive than confirmation dialogs.

### Smart Defaults
Pre-fill everything you can:
- Today's date for new entries
- Last-used project for quick add
- Most common option pre-selected
- User's timezone auto-detected

### Progressive Disclosure
```
Level 1: Summary (visible by default)
Level 2: Details (tap/click to expand)
Level 3: Advanced (hidden in menu)
```
Show what's needed now. Hide what's needed sometimes.

## Context-Specific Patterns

### "Busy/On-the-Go" User
- One-tap primary actions
- Minimal typing (voice, selection, defaults)
- Save state automatically
- Quick add without leaving current screen

### "What's On Fire?" Dashboard
- Alert section at top (red = urgent)
- Counts visible without tapping
- One tap to drill into problem
- Clear severity hierarchy

### "Non-Technical" User
- Plain language (no jargon)
- Forgiving inputs (accept multiple formats)
- Generous confirmation
- Helpful hints inline

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Designing screens | Designing journeys | Screens are stops, not destinations |
| Happy path only | All paths including errors | Users hit edge cases constantly |
| "No items" empty state | Guided empty state with CTA | Empty shouldn't feel broken |
| Confirm dialogs for everything | Undo for reversible actions | Confirmation interrupts flow |
| Navigation matches database | Navigation matches mental model | Users don't know your schema |
| Same UI for desktop and mobile | Context-appropriate patterns | Thumb zones matter |

## Exit Criteria

Phase 1:
- [ ] User context captured (who, device, goals, mental model)
- [ ] Key questions identified (what they need at a glance)

Phase 2:
- [ ] Dashboard answers key questions without tapping
- [ ] Navigation matches mental model
- [ ] Primary goals achievable in ≤3 clicks
- [ ] All empty states designed
- [ ] All error states designed
- [ ] Loading states feel intentional
- [ ] Mobile-appropriate if user is mobile
- [ ] Edge cases documented

**Done when:** A user could complete their top 3 goals without asking "how do I...?" — including when things go wrong.
