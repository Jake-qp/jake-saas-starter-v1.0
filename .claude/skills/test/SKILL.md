---
name: test
description: Use after feature implementation for systematic QA testing. Finds bugs, writes regression tests, fixes issues in a loop until clean.
argument-hint: "[feature or area to test]"
---

# Test Skill

## Overview

Testing is a loop, not a checklist. You test, find bugs, write a test that catches the bug, fix it, then test again. You keep looping until everything is clean. Every bug you find becomes a permanent regression test.

## How QA Engineers Think

**"What did the spec promise?"**
Before exploring, load the spec. Know what was promised. Test each acceptance criterion systematically. Don't wander—verify.

**"What could break that we didn't think of?"**
Edge cases hide bugs. Empty inputs, max values, special characters, network failures, race conditions. Generate these systematically based on the feature type, then test each one.

**"Every bug I find is a gift."**
A bug found now is a bug not shipped. But more importantly: a bug found now becomes a test that prevents that bug forever. The test is the real output of QA.

### What Separates Amateurs from Professionals

Amateurs find bugs and fix them.
Professionals find bugs, write tests that catch them, then fix them.

The amateur thinks: "Found a bug, fixed it, done."
The professional thinks: "Found a bug. Let me write a test that fails because of this bug. Now let me fix it. Now the test passes. Now this bug can never come back."

When you find a bug without writing a test first—STOP. The test is more valuable than the fix.

## When to Use

- After `/build` completes and you want thorough QA
- When the user reports bugs or issues
- Before launch or release
- When resuming work on a feature after time away
- **NOT** during initial implementation (use `/build` with TDD)
- **NOT** for single known bugs (use `/fix`)

## The Testing Loop

```
┌─────────────────────────────────────────────────────────┐
│                    /test "feature"                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  1. SCOPE                                                │
│     Load spec → Extract acceptance criteria              │
│     Identify: files, components, APIs, routes            │
│     List what needs testing                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. VERIFY                                               │
│     npm test (full suite)                                │
│     npm run build                                        │
│     npm run lint (if exists)                             │
│     Type check (if TypeScript)                           │
│                                                          │
│     If failures → go to REPAIR                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. EXPLORE                                              │
│     For each AC: verify in browser (Chrome extension)    │
│     Generate edge cases based on feature type            │
│     Test each edge case                                  │
│     Check console for errors                             │
│                                                          │
│     If failures → go to REPAIR                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. REPAIR (loop until clean)                            │
│     ┌─────────────────────────────────────────────────┐ │
│     │  For each bug:                                  │ │
│     │  1. Write failing test FIRST                    │ │
│     │  2. Run test → Confirm RED                      │ │
│     │  3. Fix the bug                                 │ │
│     │  4. Run test → Confirm GREEN                    │ │
│     │  5. Run full suite → No regressions             │ │
│     │  6. Commit: "fix: description"                  │ │
│     └─────────────────────────────────────────────────┘ │
│     Return to VERIFY                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  5. CLEAN                                                │
│     All automated checks pass                            │
│     All ACs verified in browser                          │
│     Edge cases covered                                   │
│     No console errors                                    │
│     Done                                                 │
└─────────────────────────────────────────────────────────┘
```

## The Bug-to-Test Discipline

This is the core discipline. **Never fix a bug without writing a test first.**

```
❌ Bug found: "Form submits with empty required field"
     │
     ├─ 1. Write test that reproduces the bug
     │
     │     it('should reject submission with empty required field', () => {
     │       const result = validateForm({ name: '' });
     │       expect(result.valid).toBe(false);
     │       expect(result.errors).toContain('name is required');
     │     });
     │
     ├─ 2. Run test → Confirm it FAILS (RED)
     │     This proves the bug exists
     │
     ├─ 3. Fix the code
     │     Add validation for empty name field
     │
     ├─ 4. Run test → Confirm it PASSES (GREEN)
     │     This proves the bug is fixed
     │
     └─ 5. Commit
          "fix: reject form submission with empty required field"

          This bug can NEVER come back. The test guards it forever.
```

### Why Test First?

| Without Test First | With Test First |
|-------------------|-----------------|
| Bug fixed, might come back | Bug fixed, permanently guarded |
| No proof bug existed | Test documents the bug |
| No proof it's fixed | Passing test proves the fix |
| Manual verification needed | Automated verification forever |

## Edge Case Generation

Don't explore randomly. Generate edge cases systematically based on feature type:

### Forms & Input

| Edge Case | Test |
|-----------|------|
| Empty required fields | Submit with each required field empty |
| Max length exceeded | Input beyond max length |
| Special characters | `<script>`, `'; DROP TABLE`, `\n\r\t` |
| Unicode | Emojis, RTL text, Chinese characters |
| Whitespace only | `"   "` (spaces, tabs) |
| Leading/trailing spaces | `" value "` |
| Copy-paste formatting | Rich text pasted into plain field |

### Lists & Collections

| Edge Case | Test |
|-----------|------|
| Empty state | Zero items |
| Single item | Exactly one item |
| Many items | 100+ items (pagination?) |
| Duplicate items | Same item twice |
| Rapid additions | Add many items quickly |
| Delete while loading | Delete during async operation |

### Authentication & Permissions

| Edge Case | Test |
|-----------|------|
| Expired token | Action after session timeout |
| Invalid token | Malformed or tampered JWT |
| Missing permissions | Access resource without permission |
| Concurrent sessions | Same user, multiple tabs |
| Role escalation | Try admin actions as regular user |

### CRUD Operations

| Edge Case | Test |
|-----------|------|
| Create duplicate | Same unique field twice |
| Read non-existent | ID that doesn't exist |
| Update stale | Edit after someone else edited |
| Delete referenced | Delete item that others depend on |
| Rapid mutations | Create/update/delete in quick succession |

### API & Network

| Edge Case | Test |
|-----------|------|
| Slow response | Response takes 5+ seconds |
| Timeout | Response never comes |
| 4xx errors | 400, 401, 403, 404, 422 |
| 5xx errors | 500, 502, 503 |
| Empty response | `{}` or `[]` |
| Malformed response | Invalid JSON |
| Network disconnect | Offline during operation |

## Browser Verification (Chrome Extension)

For UI features, verify in the actual browser:

```
1. Navigate to the feature
2. Walk through each user flow from the spec
3. Open DevTools Console - check for errors
4. Test responsive breakpoints (mobile, tablet, desktop)
5. Test keyboard navigation (Tab, Enter, Escape)
6. Check loading states (throttle network in DevTools)
7. Check error states (disconnect network, use invalid data)
```

### Console Error Check

```javascript
// In browser console, watch for:
// - Uncaught exceptions
// - Failed network requests (red in Network tab)
// - React/Vue warnings
// - Unhandled promise rejections
// - 404s for assets
```

## Integration Verification

After testing the feature in isolation, verify it works with the rest of the system:

1. **Identify connected features**: What else touches this data or UI?
2. **Test interactions**: Does feature A still work after feature B changes data?
3. **Check navigation**: Can you get to/from this feature correctly?
4. **Verify data persistence**: Refresh the page - is data still there?

## Quick Reference

| Situation | Action |
|-----------|--------|
| Starting QA | Load spec, list ACs to verify |
| Found a bug | Write failing test FIRST, then fix |
| All tests pass | Move to browser verification |
| Console error found | Treat as bug → test → fix |
| Edge case fails | Treat as bug → test → fix |
| Everything passes | Done - feature is verified |

## Common Mistakes

| Mistake | Why It's Wrong | Do This Instead |
|---------|----------------|-----------------|
| Fix bug without test | Bug can come back | Write test first, always |
| Skip edge cases | Bugs hide in edges | Use edge case matrix |
| Only test happy path | Real users break things | Test error paths too |
| Ignore console warnings | Warnings become errors | Treat warnings as bugs |
| Test in isolation only | Integration bugs exist | Verify with connected features |
| Random exploration | Wastes time, misses bugs | Systematic edge case generation |

## Exit Criteria

- [ ] Spec loaded and ACs listed
- [ ] All automated checks pass (tests, build, lint, types)
- [ ] Each AC verified in browser
- [ ] Edge cases tested based on feature type
- [ ] No console errors or warnings
- [ ] Every bug found has a regression test
- [ ] Integration with related features verified
- [ ] Feature works after page refresh

**Done when:** You've systematically verified every AC and edge case, and every bug you found is now guarded by a test.

## Report Template

After testing, report:

```markdown
## Test Results: [Feature Name]

### Verification
- Tests: X passing
- Build: clean
- Lint: clean

### Acceptance Criteria
- [ ] AC1: [status]
- [ ] AC2: [status]
- [ ] ...

### Edge Cases Tested
| Category | Cases Tested | Bugs Found |
|----------|--------------|------------|
| Forms | 6 | 1 (fixed) |
| ... | | |

### Bugs Found & Fixed
1. **[Bug description]**
   - Test: `it('should...', ...)`
   - Fix: [brief description]
   - Commit: `fix: ...`

### Browser Verification
- Console errors: None / [list]
- Responsive: Tested mobile, tablet, desktop
- Keyboard nav: Working

### Status: CLEAN / [issues remaining]
```
