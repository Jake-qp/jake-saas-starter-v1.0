---
description: Explore a vague idea. Usage: /brainstorm "idea"
---

> **Vibe System V8.7** - See `.claude/SYSTEM.md` for full documentation.

# /brainstorm - Explore Ideas

**Idea:** $ARGUMENTS

---

## Purpose

Turn vague ideas into actionable specifications. No code.

---

## Questions

1. **What problem does this solve?**
2. **Who is this for?**
3. **What's the simplest version?**
4. **What already exists?**
5. **What's the risky part?**

---

## Output

After exploration:
- Ready to build? → `/build "refined description"`
- Need research? → Spawn `.claude/agents/researcher.md`
- Too big? → Break down, add to .tasks
- Not worth it? → Document decision, move on

---

## Save to SCRATCHPAD

```markdown
## Brainstorm: [Idea]
Date: [today]

### Summary
[Key insights]

### Decision
[Build / Research / Break down / Pass]

### Next Steps
[If applicable]
```
