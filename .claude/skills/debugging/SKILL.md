---
name: debugging
description: Use when tests fail, errors occur, or behavior is unexpected. Before randomly changing code hoping something works.
---

# Debugging Skill

## Overview

Debugging is hypothesis-driven investigation, not guessing. Every change should test a specific theory. If you're changing code without a hypothesis, you're not debugging—you're gambling.

## How Debugging Experts Think

**"What changed?"**
Bugs don't appear from nowhere. Something changed—code, data, environment, dependencies. Find what changed and you've narrowed the search space by 90%. The answer is almost always in the diff.

**"What's my hypothesis?"**
Before touching code, state your theory: "I believe X is happening because Y." Then design an experiment to prove or disprove it. No hypothesis = no debugging, just random edits.

**"What's the simplest explanation?"**
When you hear hoofbeats, think horses, not zebras. The bug is probably in your code, not the framework. It's probably in the code you just changed, not code that's worked for months. Start simple.

### What Separates Amateurs from Professionals

Amateurs change things and see what happens.
Professionals form hypotheses and gather evidence.

The amateur thinks: "Let me try adding a null check here."
The professional thinks: "I hypothesize this is null because X. Let me log the value to confirm."

When catching yourself changing code without a hypothesis—STOP. You're making the bug harder to find.

## When to Use

- Test failures
- Runtime errors
- Unexpected behavior
- After `/fix` command
- **NOT** for new features (use appropriate build skill)
- **NOT** for refactoring working code (use refactor command)

## The 3-Failure Rule (CRITICAL)

After 3 failed attempts at the same approach:

1. **STOP** — More of the same won't work
2. **Step back** — You're missing something fundamental
3. **Change strategy** — Try a completely different approach
4. **Escalate** — Spawn explorer/fixer agent if needed

Repeating failed approaches is the #1 debugging mistake. The definition of insanity applies.

## The Debugging Process

### Step 1: Reproduce

Before anything else, make the bug happen on demand.

```bash
# Create a failing test that captures the bug
npm test -- --grep "should handle empty input"
```

**Can't reproduce it?** Get more information:
- Exact steps from the user
- Environment details (OS, Node version, browser)
- Input data that triggers it
- Timing (always fails? intermittent?)

**No reproduction = no debugging.** You're guessing in the dark.

### Step 2: Isolate

Narrow down WHERE the failure occurs.

**Binary Search Method:**
```
1. Find a point where data is correct
2. Find a point where data is wrong
3. Check the midpoint
4. Repeat until you find the exact line
```

**Logging Strategy:**
```javascript
// Add breadcrumbs at key points
console.log('[DEBUG] Input:', JSON.stringify(input));
console.log('[DEBUG] After transform:', JSON.stringify(result));
console.log('[DEBUG] Before save:', JSON.stringify(data));
```

**Isolation Questions:**
- Does it fail with minimal input?
- Does it fail in isolation (no other code)?
- Does it fail with hardcoded data?
- Which exact line is the last "good" state?

### Step 3: Hypothesize

State your theory BEFORE changing anything.

```markdown
**Symptom:** User creation fails with "invalid email" error

**Hypothesis:** Email validation regex rejects valid emails with + character

**Evidence needed:** 
1. Log the exact email being validated
2. Test regex against "user+tag@example.com"
3. Check if this worked before (git blame)

**Test:** If hypothesis is correct, the regex will reject "user+tag@example.com"
```

### Step 4: Gather Evidence

Test your hypothesis. Don't fix yet—verify.

```javascript
// Test the hypothesis
console.log('Email:', email);
console.log('Regex test:', /^[a-zA-Z0-9]+@/.test(email));
// Expected: false for valid email → confirms hypothesis
```

**Evidence outcomes:**
- Hypothesis confirmed → Proceed to fix
- Hypothesis disproven → Form new hypothesis
- Inconclusive → Need more data

### Step 5: Fix Root Cause

Fix the underlying problem, not the symptom.

| ❌ Symptom Fix | ✅ Root Cause Fix |
|---------------|-------------------|
| Add try/catch to hide error | Fix why error occurs |
| Add null check before crash | Fix why value is null |
| Add retry logic | Fix why it fails |

**Minimal change.** Don't refactor while debugging. Fix the bug, verify, THEN refactor.

### Step 6: Verify

```bash
# Original bug is fixed
npm test -- --grep "the failing test"

# No new bugs introduced
npm test

# Manual verification
# Actually reproduce the original steps and confirm fix
```

## Debugging Techniques

| Technique | When to Use |
|-----------|-------------|
| Console logging | Following data flow through code |
| Debugger breakpoints | Inspecting state at specific moments |
| Git bisect | Finding which commit introduced bug |
| Minimal reproduction | Complex bugs that need isolation |
| Rubber duck | When stuck—explain the problem aloud |
| Read the error | Actually read the full stack trace |

### Git Bisect (Finding Regressions)

```bash
git bisect start
git bisect bad                 # Current commit is broken
git bisect good abc123         # This commit worked
# Git checks out middle commit
npm test                       # Test it
git bisect good                # or git bisect bad
# Repeat until you find the breaking commit
git bisect reset
```

### Minimal Reproduction

```javascript
// Strip away everything until bug disappears
// Then add back until it reappears
// The last thing you added is the culprit

// Step 1: Does it fail with hardcoded data?
const result = processUser({ email: "test+tag@example.com" });

// Step 2: Does it fail without the middleware?
// Step 3: Does it fail with only this one function?
```

## Quick Reference

| Situation | First Action |
|-----------|-------------|
| Test failure | Read the actual error message completely |
| "It worked yesterday" | Check git diff since yesterday |
| Intermittent failure | Add logging, reproduce 10 times |
| Works locally, fails in CI | Check environment differences |
| Third-party API error | Check their status page, verify credentials |
| Null reference | Trace backwards—where should the value come from? |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Changing code without hypothesis | State theory first | Random changes waste time |
| Reading error message partially | Read the FULL stack trace | Answer is often in the trace |
| Fixing symptom | Finding root cause | Symptom fixes create new bugs |
| Debugging and refactoring | One thing at a time | Mixing them hides the problem |
| 4th attempt at same approach | Stop after 3 failures, change strategy | Insanity is repeating failures |
| "It must be the framework" | Assume it's your code first | It's almost never the framework |

## Exit Criteria

- [ ] Bug reproduced reliably (failing test exists)
- [ ] Hypothesis formed and tested with evidence
- [ ] Root cause identified (not just symptom)
- [ ] Minimal fix applied
- [ ] Failing test now passes
- [ ] All other tests still pass
- [ ] Fix documented (what was wrong and why)

**Done when:** The bug is fixed, you can explain WHY it was happening, and you haven't introduced new bugs.

---

## External API/Library Errors (V8.7)

When debugging errors involving external dependencies, follow this protocol:

### 1. Recognize External API Error Patterns

These errors often indicate **outdated API usage**, not logic bugs:

| Error Pattern | Likely Cause |
|---------------|--------------|
| `TypeError: X is not a function` | Method renamed or removed |
| `Invalid parameter: X` | API parameter changed |
| `Property 'X' does not exist on type 'Y'` | TypeScript types outdated |
| Unexpected API response shape | Response format changed |
| 404/400 from external services | Endpoint changed |
| `Cannot find module 'X'` | Import path changed |

### 2. Check Current Documentation FIRST

**BEFORE attempting fixes**, verify the current API:

```
ref_search_documentation("[library] [feature] current API")
```

**Good queries:**
- `ref_search_documentation("Stripe PaymentIntent create 2024")`
- `ref_search_documentation("NextAuth session callback return type")`
- `ref_search_documentation("Prisma relation queries include select")`

### 3. Compare and Fix

After getting current docs:
1. What does the current API say?
2. How does your code differ?
3. Fix to match **current** API, not guessed API

### Anti-Pattern (Wastes Time)

```
❌ Error: method not found
→ Try different method name
→ Still error, try different parameter
→ Still error, try different import
→ [5 more guesses, 30 minutes wasted]
```

### Correct Pattern (Fixes Fast)

```
✅ Error: method not found
→ ref_search_documentation("[library] [feature]")
→ See current method signature
→ Fix once, correctly
→ [Done in 2 minutes]
```

### When NOT to Use Ref

- Debugging YOUR code logic (Ref doesn't know your codebase)
- Errors in code you wrote (not library code)
- Performance issues (profiling needed, not docs)
