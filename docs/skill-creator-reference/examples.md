# Skill Examples

Complete, real-world skill examples demonstrating different archetypes. Use these as starting points when creating new skills.

---

## Example 1: Simple Reference Skill — Coding Standards

**Archetype:** Reference
**Capabilities used:** Just `name` + `description` (auto-invocable, no restrictions)

```markdown
---
name: go-conventions
description: Use when writing or reviewing Go code. Enforces team conventions for naming, error handling, and package structure.
---

# Go Conventions

## Overview

These are the conventions that separate clean Go from "Go written by someone who thinks in Java." Idiomatic Go is simple, explicit, and boring in the best way.

## How Go Experts Think

**"Is this the simplest thing that works?"**
Go rewards simplicity. If you're reaching for generics, reflection, or clever abstractions — stop. Can you solve it with a concrete type and an if statement? Do that first.

**"Would a new team member understand this in 30 seconds?"**
Go code should read like prose. If someone needs to trace three levels of abstraction to understand a function, it's too clever.

### What Separates Amateurs from Professionals

Amateurs write Go like Java: deep package hierarchies, interface-first design, AbstractFactoryPattern. Professionals write flat packages, concrete types first, and only extract interfaces when two consumers need different implementations.

When catching yourself creating a `pkg/utils/helpers.go` — STOP.

## Quick Reference

| Situation | Do This |
|-----------|---------|
| Error handling | `if err != nil { return fmt.Errorf("doing X: %w", err) }` — always wrap with context |
| Naming | `userCount` not `numberOfUsers`. Short, clear, no stuttering (`user.Name` not `user.UserName`) |
| Package names | Single lowercase word. `auth` not `authentication` not `authPackage` |
| Interfaces | Define at consumer, not provider. Small: 1-2 methods |
| Struct methods | Pointer receiver unless struct is tiny and immutable |

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| `package authenticationService` | `package auth` | Go packages are short, single words |
| Defining interfaces upfront | Concrete types first, interface when needed | YAGNI — most code has one implementation |
| `utils.FormatDate()` | Method on the type that owns the data | Utils packages are a code smell in Go |
| `if err != nil { return err }` | `return fmt.Errorf("creating user: %w", err)` | Unwrapped errors are untraceable |
```

---

## Example 2: Parameterized Task Skill — Fix Issue

**Archetype:** Dynamic Context + Task
**Capabilities used:** `argument-hint`, `$ARGUMENTS`, `` !`command` ``, `disable-model-invocation`, `allowed-tools`

```markdown
---
name: fix-issue
description: Use when fixing a specific GitHub issue. Loads issue context and guides through fix process.
argument-hint: "[issue-number]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Fix Issue

## Issue Context

**Issue #$ARGUMENTS:**
!`gh issue view $ARGUMENTS --json title,body,labels,assignees -q '"\(.title)\n\nLabels: \(.labels | map(.name) | join(", "))\nAssignees: \(.assignees | map(.login) | join(", "))\n\n\(.body)"'`

**Related comments:**
!`gh issue view $ARGUMENTS --json comments -q '.comments[-3:] | .[] | "\(.author.login): \(.body[0:200])\n---"'`

## How Bug Fixers Think

**"What's the actual symptom vs. the reported symptom?"**
Users report what they see, not what's broken. "The button doesn't work" might mean the click handler is wrong, the API is down, or the button is behind an invisible overlay. Read the issue, then form your own hypothesis.

**"What's the smallest change that fixes this?"**
Resist the urge to refactor while fixing. Fix the bug. Ship the fix. Refactor later if needed.

## Workflow

### Step 1: Understand
Read the issue context above. Identify:
- What's the expected behavior?
- What's the actual behavior?
- Can you reproduce mentally from the description?

### Step 2: Locate
Find the relevant code:
- Search for keywords from the issue
- Trace the code path from UI to data layer
- Identify the exact location of the bug

### Step 3: Fix
- Write a failing test that reproduces the bug
- Make the minimal change to fix it
- Verify the test passes
- Check for related edge cases

### Step 4: Verify
- Run the full test suite
- Check for regressions
- Confirm the fix addresses the original issue description

## Exit Criteria
- [ ] Root cause identified and explained
- [ ] Failing test written before fix
- [ ] Minimal fix implemented
- [ ] All tests pass
- [ ] No regressions introduced

**Done when:** Issue #$ARGUMENTS is fixed with a test proving it.
```

---

## Example 3: Research Skill — Architecture Audit

**Archetype:** Research
**Capabilities used:** `context: fork`, `agent: Explore`, `argument-hint`

```markdown
---
name: architecture-audit
description: Audit codebase architecture for patterns, coupling, and improvement opportunities. Returns structured findings.
argument-hint: "[area: auth|api|data|all]"
context: fork
agent: Explore
---

# Architecture Audit

## Your Task

Audit the codebase architecture, focusing on: $ARGUMENTS

## Investigation Steps

### 1. Map the Structure
- Use Glob to find all source files: `**/*.ts`, `**/*.tsx`
- Identify the main directories and their purposes
- Count files per directory to find hotspots

### 2. Analyze Dependencies
- Search for import patterns: `from '@/'`, `from '../'`
- Identify circular dependencies (A imports B imports A)
- Check for proper layer separation (UI -> Logic -> Data)

### 3. Check Key Patterns
- **Auth:** Are all mutations checking permissions? Search for `viewerHasPermission`, `getAuthUserId`
- **Error Handling:** Are errors properly typed and handled? Search for `try/catch`, `throw`
- **Data Access:** Is data access going through proper abstractions? Search for direct DB calls vs. helper functions

### 4. Identify Concerns

Look for:
- Functions over 100 lines (complexity)
- Files over 500 lines (needs splitting)
- Deeply nested directories (over-organization)
- Unused exports (dead code)
- Inconsistent naming patterns
- Missing type safety (any, unknown, type assertions)

## Report Format

### Architecture Overview
[2-3 sentences describing the overall structure]

### Metrics
- Total source files: [count]
- Largest files: [top 5 with line counts]
- Deepest nesting: [path]

### Findings (by severity)

#### Critical
1. **[Finding]** — `file:line` — [why it matters]

#### Warning
1. **[Finding]** — `file:line` — [impact]

#### Info
1. **[Observation]** — [context]

### Recommendations
1. [Highest priority action]
2. [Second priority]
3. [Third priority]
```

---

## Example 4: Generator Skill with Scripts — Component Scaffold

**Archetype:** Generator
**Capabilities used:** `argument-hint`, `disable-model-invocation`, `allowed-tools`, `scripts/` directory

```markdown
---
name: new-component
description: Use when creating a new React component. Scaffolds component, tests, and stories following project patterns.
argument-hint: "[ComponentName]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep
---

# New Component

## Overview

Scaffold a new React component with tests and stories, following existing project patterns exactly. No guessing — read existing components first.

## What Gets Generated

```
components/
└── $ARGUMENTS/
    ├── $ARGUMENTS.tsx        # Component implementation
    ├── $ARGUMENTS.test.tsx   # Unit tests
    └── index.ts              # Barrel export
```

## Generation Process

### Step 1: Learn Existing Patterns

Before generating anything, read 2-3 existing components to learn the project's patterns:

1. Find components: `components/**/*.tsx`
2. Read one simple component and one complex component
3. Note: import style, prop types pattern, test structure, export pattern

**CRITICAL:** Match the existing patterns exactly. Don't introduce new conventions.

### Step 2: Generate Component

Create `components/$ARGUMENTS/$ARGUMENTS.tsx`:
- Match the import style from existing components
- Define props interface as `${ARGUMENTS}Props`
- Use the same patterns for default props, ref forwarding, etc.
- Include `displayName` if existing components do

### Step 3: Generate Tests

Create `components/$ARGUMENTS/$ARGUMENTS.test.tsx`:
- Match the test structure from existing tests
- Include: renders without error, renders with props, accessibility check
- Use the same test utilities and patterns

### Step 4: Generate Barrel Export

Create `components/$ARGUMENTS/index.ts`:
- Export component and types
- Match existing barrel export patterns

### Step 5: Verify

- Check all generated files for TypeScript errors
- Verify imports resolve correctly
- Confirm patterns match existing components

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| Guessing patterns | Reading existing components first | Every project is different |
| Adding extra files (stories, styles) | Only generating what existing components have | Match project conventions |
| Using different import style | Matching exact import patterns | Consistency matters |

## Exit Criteria
- [ ] Component renders without errors
- [ ] Tests pass
- [ ] Patterns match existing components exactly
- [ ] No new conventions introduced
```

---

## Example 5: Tech Stack Skill — Convex Patterns

**Archetype:** Reference (with supporting files)
**Capabilities used:** `name`, `description`, supporting `patterns.md` file, `allowed-tools`

```markdown
---
name: convex-patterns
description: Use when writing Convex functions, queries, mutations, or actions. Enforces project-specific Convex conventions and security patterns.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Convex Patterns

## Overview

Convex functions in this project follow strict security conventions. Every mutation must authenticate, authorize, check entitlements, and audit. This isn't optional — it's the security architecture.

## How Backend Security Experts Think

**"What if someone calls this function directly?"**
Never trust the client. Every Convex function is a public API endpoint. If a mutation doesn't check permissions, it's a security hole — even if "the UI won't let users do that."

**"What's the blast radius of getting this wrong?"**
A missing auth check on a read query leaks data. A missing auth check on a mutation lets attackers modify data. A missing entitlement check lets free users access paid features. Rate every function by its blast radius.

### What Separates Amateurs from Professionals

Amateurs write the business logic first and "add auth later." Professionals write the security checks first and the business logic is the easy part.

When catching yourself writing a mutation without `viewerHasPermissionX()` — STOP.

## The Mutation Pattern (REQUIRED)

Every mutation follows this exact sequence:

```typescript
export const doSomething = mutation({
  args: { teamId: v.id("teams"), /* ... */ },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const userId = await ctx.viewerX();

    // 2. Authorize
    await viewerHasPermissionX(ctx, args.teamId, "Permission Name");

    // 3. Entitle
    await checkEntitlement(ctx, args.teamId, "limitKey");

    // 4. Rate limit (for expensive operations)
    await checkRateLimit(ctx, "operation:key", { per: "minute", limit: 10 });

    // 5. Execute (business logic)
    const result = await ctx.table("items").insert({ /* ... */ });

    // 6. Audit (for admin/sensitive actions)
    await auditLog(ctx, "item.created", { teamId: args.teamId, itemId: result });

    return result;
  },
});
```

**Skipping steps is never acceptable.** Steps 4 and 6 may be omitted for simple, non-sensitive operations — but 1, 2, 3, and 5 are always required.

## Quick Reference

| Function Type | Required Checks |
|---------------|----------------|
| Query (team data) | Authenticate + Authorize |
| Query (user's own data) | Authenticate |
| Mutation (team action) | Authenticate + Authorize + Entitle + Execute + Audit |
| Mutation (user setting) | Authenticate + Execute |
| Admin mutation | Authenticate + `isSuperAdmin` + Execute + Audit |
| Internal function | None (already trusted) |

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| `getAuthUserId()` without checking null | `ctx.viewerX()` (throws if not authenticated) | Silently proceeding without auth is a security hole |
| Checking permissions after business logic | Check permissions FIRST | Business logic should never run without authorization |
| Hardcoding entitlement limits | Using `checkEntitlement(ctx, teamId, "key")` | Limits change per plan — hardcoding breaks billing |
| No rate limiting on AI/email operations | Always rate limit expensive operations | Prevents abuse and runaway costs |

For detailed patterns and more examples, see [patterns.md](patterns.md) if available.
```

---

## Archetype Summary

| Example | Archetype | Key Capabilities |
|---------|-----------|-----------------|
| Go Conventions | Reference | Just `name` + `description` |
| Fix Issue | Dynamic Context + Task | `argument-hint`, `` !`command` ``, `disable-model-invocation` |
| Architecture Audit | Research | `context: fork`, `agent: Explore` |
| Component Scaffold | Generator | `argument-hint`, `disable-model-invocation`, `allowed-tools` |
| Convex Patterns | Reference (with files) | `allowed-tools`, supporting files |

Each example demonstrates a different combination of capabilities. Start with the closest match and adjust.
