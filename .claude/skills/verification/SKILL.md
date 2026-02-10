---
name: verification
description: Use in Phase 5 before marking any feature complete, before commits, and before launch. Proof that work is done, not promises.
---

# Verification Skill

## Overview

Verification is proof, not promises. "It should work" is not verification. "Here's the test output showing it works" is verification. Your job is to produce evidence that would satisfy a skeptical reviewer.

## How QA Leads Think

**"Show me it works."**
Words mean nothing. Assertions mean nothing. Screenshots of passing tests, build output, and demonstrated behavior—that's evidence. If you can't show it, you can't ship it.

**"What does the spec actually say?"**
The spec is the contract. Not what you think it says, not what you remember, not what makes sense—what it actually says. Open it. Read each criterion. Verify each one explicitly.

**"What didn't we test?"**
Passing tests prove what was tested works. They say nothing about what wasn't tested. Edge cases, error paths, boundary conditions—if it's not tested, assume it's broken.

### What Separates Amateurs from Professionals

Amateurs say "it works" based on a quick manual check.
Professionals produce evidence logs that prove it works.

The amateur thinks: "I tried it and it seemed fine."
The professional thinks: "Tests pass, build succeeds, each spec criterion is verified with evidence."

When catching yourself about to mark something complete without evidence—STOP. Get the proof first.

## When to Use

- Phase 5 of any build
- Before marking ANY feature complete
- Before committing code
- Before `/launch` command
- After significant changes to "complete" features

## The Verification Protocol

### Step 1: Run Automated Checks

```bash
# Run tests - show full output
npm test 2>&1
```
**Required:** All tests pass. Screenshot or paste the output.

```bash
# Run build - show full output
npm run build 2>&1
```
**Required:** Build succeeds with no errors. Screenshot or paste the output.

```bash
# Run linter - show full output
npm run lint 2>&1
```
**Required:** No errors (warnings may be acceptable).

**No skipping.** Even if "nothing changed," run the checks. Prove it.

### Step 2: Spec Compliance Check

Open `docs/specs/[feature].spec`. For EACH acceptance criterion:

| Criterion | Implemented? | Tested? | Evidence |
|-----------|--------------|---------|----------|
| AC1: [text] | ✅/❌ | ✅/❌ | [file:line or test name] |
| AC2: [text] | ✅/❌ | ✅/❌ | [file:line or test name] |
| AC3: [text] | ✅/❌ | ✅/❌ | [file:line or test name] |

**Every criterion needs evidence.** "Yes it works" is not evidence. "Implemented in `src/projects.ts:45`, tested in `projects.test.ts:23`" is evidence.

### Step 3: Edge Case Verification

For each edge case in the spec:

| Edge Case | Handled? | Behavior | Evidence |
|-----------|----------|----------|----------|
| Empty input | ✅/❌ | [what happens] | [test name or manual verification] |
| Max length | ✅/❌ | [what happens] | [test name or manual verification] |
| Invalid data | ✅/❌ | [what happens] | [test name or manual verification] |

**Untested edge cases are bugs waiting to happen.** If the spec lists it, verify it.

### Step 4: Manual Smoke Test

Even with passing tests, manually verify the critical path:

```markdown
## Manual Verification
1. [ ] App loads without errors
2. [ ] Primary user flow completes successfully
3. [ ] Data persists correctly (refresh and verify)
4. [ ] Error states display properly (test one)
5. [ ] Mobile/responsive works (if applicable)
```

### Step 5: Create Evidence Log

Document everything in SCRATCHPAD.md:

```markdown
## Verification Evidence - [Feature Name]
**Date:** [timestamp]
**Verified by:** Claude

### Automated Checks
```
npm test
✅ 24 tests passing, 0 failing
[paste relevant output]
```

```
npm run build  
✅ Build succeeded
[paste relevant output]
```

### Spec Compliance
- [x] AC1: User can create project → `src/projects.ts:45`, test: `creates project successfully`
- [x] AC2: Budget displays in list → `ProjectCard.tsx:23`, test: `shows budget badge`
- [x] AC3: Over-budget indicator → `BudgetBadge.tsx:12`, test: `displays red when over`

### Edge Cases
- [x] Empty project name → Shows validation error, test: `rejects empty name`
- [x] Negative budget → Shows validation error, test: `rejects negative budget`
- [x] Very long name (100+ chars) → Truncates with ellipsis, test: `truncates long names`

### Manual Smoke Test
- [x] Created new project successfully
- [x] Project appears in list with correct data
- [x] Over-budget project shows red indicator
- [x] Data persists after refresh

### Outstanding Issues
[None / List any issues found]
```

### Step 6: Documentation Updates

**REQUIRED:** Check `.claude/rules/documentation-updates.md` and update docs as needed.

| Document | Update When | Check |
|----------|-------------|-------|
| CHANGELOG.md | Always | ✅ Required |
| progress.md | Always (REPLACE, not append) | ✅ Required |
| feature_list.json | Always | ✅ Required |
| docs/architecture/features.md | Feature implementation details | If applicable |
| ARCHITECTURE.md | Feature Index entry only | If new feature |
| .claude/rules/*.md | Domain-specific implementation details | If applicable |
| CLAUDE.md | New core concepts or quick-reference changes | Rarely |

**ARCHITECTURE.md Rules (CRITICAL):**
- **Target: ~300 lines max** — This is a navigation hub, not a documentation dump
- **Add only:** One row to Feature Index table, high-level data flow changes
- **Never add:** Full database/ORM function tables, detailed data models, component lists
- **Details go to:** `docs/architecture/features.md` for implementation deep-dives

```
❌ WRONG: Adding 50+ lines to ARCHITECTURE.md for one feature
✅ RIGHT: Add 1 row to Feature Index, full details in docs/architecture/features.md
```

**progress.md Update (V8.8):**
progress.md uses a fixed structure. When a feature completes, **REPLACE** the entire file:
- Move current feature details to "Last Completed" section
- Clear "Current Feature" for next build
- Update "Project State" with current stats

See `.claude/commands/build.md` for the exact template.

**Checklist:**
```markdown
## Documentation Review
- [ ] CHANGELOG.md updated
- [ ] progress.md REPLACED with completion (not appended)
- [ ] feature_list.json status updated to "complete"
- [ ] docs/architecture/features.md updated (if implementation details needed)
- [ ] ARCHITECTURE.md Feature Index entry added (if new feature, 1 row only)
- [ ] .claude/rules/*.md updated (if domain rules changed)
```

**Do NOT wait to be asked.** Documentation is part of "done."

## Verification Levels

| Level | When | What to Verify |
|-------|------|----------------|
| Quick | Small changes | Tests pass, build succeeds |
| Standard | Feature complete | Full protocol above + security audit |
| Launch | Before production | Full protocol + deep security audit + performance |

## Security Audit (REQUIRED for Standard+)

**Load the security-check skill:**
```bash
cat .claude/skills/security-check/SKILL.md
```

**The security-check skill is adaptive** - it detects what changed and runs only relevant checks:

| If You Changed | Checks Run |
|----------------|------------|
| Auth code | Full auth audit |
| API endpoints | Input validation, authorization |
| Database code | Injection, access control |
| File uploads | Type/size validation, path traversal |
| Frontend only | XSS, client secrets (skip backend checks) |
| Config files | Secrets exposure, debug flags |

**Always runs:** Secrets scan (hardcoded credentials)

**Follow the skill's adaptive process:**
1. Detect change categories
2. Announce which checks will run/skip
3. Run targeted checks
4. Report in adaptive format

**Exit criteria:**
- [ ] Secrets scan passed
- [ ] No CRITICAL issues
- [ ] No HIGH issues (or documented with justification)

**If issues found → Fix before proceeding to documentation.**

## Red Flags That Block Verification

| Red Flag | What It Means | Action |
|----------|---------------|--------|
| Tests failing | Code is broken | Fix before proceeding |
| Build errors | Won't deploy | Fix before proceeding |
| Spec criterion not implemented | Feature incomplete | Implement or update spec |
| Edge case untested | Bug waiting to happen | Add test or document risk |
| "It works on my machine" | Not verified | Need reproducible evidence |

## Common Verification Gaps

| Gap | Why It Matters | How to Check |
|-----|---------------|--------------|
| Error handling untested | Users will hit errors | Manually trigger an error |
| Empty states untested | First-time users see these | Test with no data |
| Loading states untested | Slow connections exist | Throttle network and test |
| Mobile untested | Users have phones | Actually test on mobile/emulator |
| Offline untested | Networks fail | Disconnect and test |

## Quick Reference

| Question | Evidence Required |
|----------|------------------|
| Do tests pass? | Test output showing all pass |
| Does it build? | Build output showing success |
| Is spec complete? | Criterion-by-criterion verification |
| Are edge cases handled? | Each edge case tested/verified |
| Does it actually work? | Manual smoke test completed |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| "Tests pass" (no output) | Paste test output as evidence | Claims without proof mean nothing |
| Checking spec from memory | Open and read actual spec file | Memory is unreliable |
| Skipping manual verification | Quick smoke test every time | Tests don't catch everything |
| "Edge cases are probably fine" | Verify each explicitly | Probably ≠ verified |
| Verification after commit | Verification before commit | Don't commit broken code |

## Exit Criteria

- [ ] `npm test` passes (output captured)
- [ ] `npm run build` succeeds (output captured)
- [ ] `npm run lint` clean (output captured)
- [ ] Each spec criterion verified with evidence
- [ ] Each edge case verified or documented
- [ ] Manual smoke test completed
- [ ] **Documentation updated:**
  - [ ] CHANGELOG.md updated
  - [ ] progress.md REPLACED (not appended) with fixed structure
  - [ ] feature_list.json status = "complete"
  - [ ] docs/architecture/features.md if implementation details needed
  - [ ] ARCHITECTURE.md Feature Index entry only (if new feature)
- [ ] Evidence log created in SCRATCHPAD
- [ ] No blocking issues outstanding

**Done when:** A skeptical reviewer could look at your evidence log and agree the feature is complete—without running anything themselves. **Documentation is not optional.**

---

## Browser Verification Protocol (V8.7)

Claude has access to Chrome via the Claude Chrome extension for visual verification.

### When to Use Browser Verification

| Phase | Trigger | What to Verify |
|-------|---------|----------------|
| Phase 2 | After UI components created | Visual design, responsive, console |
| Phase 5 | Before marking complete | User flows, console errors, visual polish |

### Browser Verification Steps

#### 1. Open App in Chrome

```
Navigate to http://localhost:3000 (or the appropriate port)
Ensure using Claude Chrome tab group for isolation
```

#### 2. Execute User Flows from Spec

For each user flow defined in the spec:

| Flow | Steps | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| [name] | [steps] | [result] | [result] | ✅/❌ |

#### 3. Check Browser Console

Inspect for:
- **Errors:** `console.error` messages (MUST fix)
- **Warnings:** React warnings, deprecation notices (SHOULD fix)
- **Network:** Failed API calls, 4xx/5xx responses (MUST fix)
- **Unhandled:** Promise rejections, uncaught exceptions (MUST fix)

#### 4. Visual Verification

Check:
- [ ] Layout matches approved Phase 2 design
- [ ] No layout shifts during loading
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] Responsive behavior (if applicable)

### Report Format

Include this in Phase 5 verification:

```markdown
## Browser Verification Results

### Environment
- URL: http://localhost:3000
- Browser: Chrome (Claude extension)

### User Flows
| Flow | Status | Notes |
|------|--------|-------|
| [flow 1] | ✅ | Worked as expected |
| [flow 2] | ❌ | Failed at step X - [details] |

### Console
- Errors: 0
- Warnings: 2 (React strict mode, acceptable)
- Network failures: 0

### Visual
- Matches approved design: ✅
- All states render correctly: ✅
- Responsive: ✅ (tested 375px, 768px, 1024px)

### Issues Found
[List any issues, or "None"]
```

### If Issues Found

1. **Console errors:** Fix immediately, re-verify
2. **Visual issues:** Fix and re-verify design match
3. **Flow failures:** Debug, fix, re-run flow
4. **Do NOT mark feature complete** until browser verification passes
