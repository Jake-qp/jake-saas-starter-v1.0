---
description: Add tests and hardening to existing code. Usage: /harden
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /harden - Retrofit Production Readiness

Use this to add tests and hardening to code that was built without TDD (prototypes, legacy code, /quick changes that grew).

---

## Phase 1: Inventory

**What exists?**
```bash
find src -name "*.ts" -o -name "*.tsx" | grep -v test | head -20
```

**What's tested?**
```bash
find src -name "*.test.*" -o -name "*.spec.*" | head -20
```

**Coverage gaps:** List files/functions without tests.

---

## Phase 2: Specification Recovery

If no .spec exists, create one from the existing code:
- What does this code do?
- What are the acceptance criteria (reverse-engineer from features)?
- What edge cases exist?

---

## Phase 3: Add Tests

**Load skills:**
- `.claude/skills/testing/SKILL.md`
- `.claude/skills/tdd/SKILL.md`

For each untested function/component:
1. Write tests for current behavior
2. Run tests - they should PASS (code exists)
3. Add edge case tests

```bash
npm test 2>&1
```

---

## Phase 4: Add Error Handling

**Load skill:** `.claude/skills/error-handling/SKILL.md`

- Add try/catch where missing
- Add input validation
- Add error boundaries (React)
- User-friendly error messages

---

## Phase 5: Add Type Safety

- Fill in `any` types
- Add missing interfaces
- Enable strict mode if not already

---

## Phase 6: Verification

**Run and show:**
```bash
npm test 2>&1
npm run build 2>&1
```

**Report:**
- Tests added: [count]
- Coverage improvement: [before] → [after]
- Error handling added to: [list]
