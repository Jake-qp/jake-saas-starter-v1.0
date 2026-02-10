---
name: tdd
description: Use when implementing any feature or fixing any bug. Before writing implementation code. Activates in Phase 4 after visual design is validated.
---

# TDD Skill

## Overview

TDD is a thinking discipline, not a testing technique. You write the test first to understand what you're building. The test is a specification that happens to be executable.

## How TDD Practitioners Think

**"What am I trying to prove?"**
Before typing any implementation, ask: what behavior am I adding? The test is your answer written in code. If you can't write the test, you don't understand the requirement.

**"Red means I know what success looks like."**
A failing test isn't a problem—it's clarity. Red means you've defined the finish line. Green means you've crossed it. Skipping red means you're wandering without a destination.

**"The smallest step that could possibly work."**
Write the simplest test. Make it pass with the simplest code. Then refactor. Resist the urge to build ahead. Every line of code you write before the test is a guess.

### What Separates Amateurs from Professionals

Amateurs write code, then write tests to prove it works.
Professionals write tests to discover what the code should do.

The amateur thinks: "I'll add tests later for coverage."
The professional thinks: "The test tells me when I'm done."

When catching yourself writing implementation before the test—STOP. You're guessing.

## When to Use

- Phase 4 of any build (after visual design is validated)
- Implementing data layer operations
- Writing business logic or calculations
- Building API endpoints
- Fixing bugs (write failing test first, then fix)
- **NOT** in Phase 2/3 (visual iteration should be fast and cheap)
- **NOT** for visual appearance (can't test "looks good")

## Why Phase 4, Not Earlier

| Phase | Tests? | Reason |
|-------|--------|--------|
| Phase 1 (Spec) | ❌ | Defining what to build |
| Phase 2 (Visual) | ❌ | Fast iteration, no friction |
| Phase 3 (Design) | ❌ | Designing data models |
| Phase 4 (Build) | ✅ | Lock behavior, then implement |
| Phase 5 (Verify) | Run | Prove everything works |

Visual iteration is fast and cheap. Don't slow it down. Once the user validates the design, THEN write tests to lock in the data layer.

## The Red-Green-Refactor Cycle

```
┌─────────────────────────────────────────┐
│  1. RED: Write a failing test           │
│     - Test doesn't pass (no code yet)   │
│     - This IS the specification         │
├─────────────────────────────────────────┤
│  2. GREEN: Make it pass                 │
│     - Simplest code that works          │
│     - No cleverness, no optimization    │
│     - Just make the red go green        │
├─────────────────────────────────────────┤
│  3. REFACTOR: Clean up                  │
│     - Tests still pass                  │
│     - Remove duplication                │
│     - Improve clarity                   │
└─────────────────────────────────────────┘
         ↑                               │
         └───────────────────────────────┘
```

## What to Test

| Test This | Why |
|-----------|-----|
| Data models / types | Catch type errors early |
| Storage CRUD | Core functionality must work |
| Business logic | Calculations must be correct |
| API endpoints | Contract validation |
| Key user flows (E2E) | Integration issues surface here |

| Skip This | Why |
|-----------|-----|
| Visual appearance | Can't automate "looks good" |
| Layout/spacing | Human judgment required |
| Animation timing | Too brittle |
| Third-party internals | Not your code |

## Writing Tests That Matter

### Test Names Are Documentation

```typescript
// ❌ Meaningless
it('test create', () => { ... });

// ✅ Specification
it('should create project with name, client, and budget', () => { ... });
it('should reject project without required name field', () => { ... });
```

### Arrange-Act-Assert Structure

```typescript
it('should calculate budget remaining correctly', () => {
  // Arrange - set up the scenario
  const project = { budget: 10000, spent: 3500 };
  
  // Act - perform the operation
  const remaining = calculateRemaining(project);
  
  // Assert - verify the outcome
  expect(remaining).toBe(6500);
});
```

### Edge Cases Are Requirements

Always test these:

| Edge Case | Example |
|-----------|---------|
| Empty input | `createProject({})` |
| Missing fields | `{ name: 'Test' }` without budget |
| Invalid types | `{ budget: "ten thousand" }` |
| Boundaries | 0, -1, MAX_VALUE |
| Duplicates | Creating same entity twice |

## Proof of Red-Green

### Before Implementation
```bash
npm test 2>&1
```
**Show failing tests.** If tests pass before implementation, you're testing the wrong thing.

### After Implementation
```bash
npm test 2>&1
```
**Show passing tests.** This is your proof of completion.

## Test File Structure

```
src/
  __tests__/
    [feature].test.ts           # Feature behavior tests
    [entity].storage.test.ts    # Data layer tests
  components/
    __tests__/
      [Component].test.tsx      # Key flow tests only
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Starting a new feature | Write failing test for first behavior |
| Bug reported | Write failing test that reproduces bug |
| Tests pass immediately | Wrong test—you haven't defined new behavior |
| Tempted to code first | STOP—write the test |
| Refactoring | Tests must pass before AND after |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Writing tests after implementation | Test first, always | Tests after are rationalization, not specification |
| Tests pass before any code | Tests must fail first (RED) | Passing test without code means wrong test |
| Testing implementation details | Test behavior/outcomes | Implementation changes; behavior shouldn't |
| "I'll add tests later" | Tests ARE the implementation process | Later never comes; bugs ship instead |
| Skipping edge cases | Edge cases are requirements | Users will find them if you don't |

## Exit Criteria

- [ ] Tests written BEFORE implementation
- [ ] Tests failed initially (RED proven)
- [ ] Implementation makes tests pass (GREEN proven)
- [ ] Data layer CRUD operations covered
- [ ] Business logic calculations covered
- [ ] Key user flows have E2E coverage
- [ ] Edge cases tested
- [ ] All tests pass
- [ ] Ready for Phase 5 verification

**Done when:** Every behavior has a test that failed before you wrote the code and passes after.
