# Skill Archetypes & Templates

Choose the archetype that best matches your skill's purpose. Each includes complete frontmatter and a content skeleton.

---

## 1. Reference Skill

**Purpose:** Adds domain knowledge and mental models. No explicit task — shapes how Claude thinks.

**When to use:** Coding standards, design patterns, project conventions, domain expertise that should influence all related work.

**Key traits:** Auto-invocable, no tool restrictions, no arguments needed.

### Frontmatter

```yaml
---
name: coding-standards
description: Use when writing or reviewing code. Enforces team conventions for style, naming, and patterns.
---
```

### Skeleton

```markdown
---
name: [domain]-standards
description: Use when [trigger condition]. [What it enforces/teaches].
---

# [Domain] Standards

## Overview
[1-2 sentences: What expertise does this transfer?]

## How [Domain] Experts Think

**"[Key question experts ask]"**
[Why this matters, what it reveals about quality]

**"[Second question]"**
[What this catches that amateurs miss]

### What Separates Amateurs from Professionals
[The gap — concrete examples of amateur vs expert behavior]

## Quick Reference

| Situation | Do This |
|-----------|---------|
| [Common situation 1] | [Expert approach] |
| [Common situation 2] | [Expert approach] |

## Patterns

### [Pattern Category 1]
[Explanation + examples]

### [Pattern Category 2]
[Explanation + examples]

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| [Anti-pattern] | [Correct pattern] | [Explanation] |
```

### Supporting Files

Usually none needed. If reference material exceeds 500 lines, split into `conventions.md` or `patterns.md`.

---

## 2. Task Skill

**Purpose:** Step-by-step workflow for a specific operation. User explicitly invokes it.

**When to use:** Deploy processes, review workflows, migration tasks, any multi-step operation that should only run on purpose.

**Key traits:** Manual invocation only, accepts arguments, restricted tools.

### Frontmatter

```yaml
---
name: deploy
description: Use when deploying to staging or production. Runs safety checks before deployment.
argument-hint: "[environment: staging|production]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash
---
```

### Skeleton

```markdown
---
name: [task-name]
description: Use when [trigger]. [What safety/value it provides].
argument-hint: "[expected-input]"
disable-model-invocation: true
allowed-tools: [tools-needed]
---

# [Task Name]

## Overview
[What this task does and why the structured approach matters]

## Prerequisites
- [ ] [Required state 1]
- [ ] [Required state 2]

## Workflow

### Step 1: [Verify/Prepare]
[What to check before starting]

**Checkpoint:** "[Verification question before proceeding]"

### Step 2: [Execute]
[Core action with specific commands/operations]

### Step 3: [Validate]
[How to confirm success]

## Rollback Plan
[What to do if something goes wrong]

## Exit Criteria
- [ ] [Testable criterion]
- [ ] [Testable criterion]

**Done when:** [Clear success statement]
```

### Supporting Files

- `checklist.md` — Detailed pre/post checks if complex
- `scripts/` — Automation scripts for validation steps

---

## 3. Research Skill

**Purpose:** Explores codebase or topic, returns findings. Runs in isolated context to avoid polluting main conversation.

**When to use:** Codebase audits, architecture analysis, dependency review, any read-only exploration where large tool outputs would clutter the main context.

**Key traits:** Context fork, Explore agent, read-only tools, accepts arguments.

### Frontmatter

```yaml
---
name: codebase-audit
description: Audit codebase for patterns, issues, and improvement opportunities. Returns structured findings.
argument-hint: "[area-to-audit or question]"
context: fork
agent: Explore
---
```

### Skeleton

```markdown
---
name: [research-topic]
description: [What it investigates]. Returns structured findings with file references.
argument-hint: "[focus-area]"
context: fork
agent: Explore
---

# [Research Topic]

## Your Task

Investigate: $ARGUMENTS

## How to Investigate

1. **Discover** — Use Glob to find relevant files matching patterns
2. **Search** — Use Grep to find specific code patterns
3. **Analyze** — Read key files and understand the architecture
4. **Report** — Summarize findings with specific `file:line` references

## What to Look For

- [Specific pattern 1 to identify]
- [Specific pattern 2 to identify]
- [Red flags to call out]

## Report Format

Structure your findings as:

### Summary
[2-3 sentence overview]

### Findings
1. **[Finding]** — `file:line` — [explanation]
2. **[Finding]** — `file:line` — [explanation]

### Recommendations
- [Actionable recommendation with priority]
```

### Supporting Files

Usually none — the skill is a focused prompt. If the research domain has complex criteria, add a `criteria.md`.

---

## 4. Generator Skill

**Purpose:** Creates artifacts — reports, HTML files, configuration, boilerplate. May use scripts for complex generation.

**When to use:** Generating documentation, scaffolding new modules, creating reports, any skill that produces files as output.

**Key traits:** Accepts arguments, may include scripts, needs Write/Edit tools.

### Frontmatter

```yaml
---
name: scaffold-module
description: Use when creating a new module or feature scaffold. Generates boilerplate files following project conventions.
argument-hint: "[module-name]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---
```

### Skeleton

```markdown
---
name: [generator-name]
description: Use when [trigger]. Generates [what it produces].
argument-hint: "[input-needed]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# [Generator Name]

## Overview
[What this generates and why the structure matters]

## Input
- **Required:** $ARGUMENTS — [what this should be]
- **Optional:** [any optional context needed]

## What Gets Generated

```
[output-directory]/
├── [file1]     # [purpose]
├── [file2]     # [purpose]
└── [file3]     # [purpose]
```

## Generation Process

### Step 1: Gather Context
[Read existing patterns to ensure consistency]

### Step 2: Generate Files
[Create each file following the patterns found]

### Step 3: Verify
[Check generated files compile/lint/pass basic validation]

## Templates

### [File Type 1]
```[language]
[Template content with $ARGUMENTS substitution]
```

### [File Type 2]
```[language]
[Template content]
```

## Exit Criteria
- [ ] All files generated
- [ ] Files follow existing project conventions
- [ ] No lint/type errors introduced
```

### Supporting Files

- `templates/` — Template files for generation
- `scripts/` — Generation or validation scripts

---

## 5. Safety Skill

**Purpose:** Enforces checks and gates. Runs automatically via hooks — users don't invoke directly.

**When to use:** Pre-commit security checks, code review gates, compliance validation, any automated safety net.

**Key traits:** Not user-invocable, hooks for automatic triggering, restricted tools.

### Frontmatter

```yaml
---
name: security-gate
description: Automatically checks for security issues before file writes. Validates no secrets, SQL injection, or XSS patterns.
user-invocable: false
allowed-tools: Read, Grep, Glob
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "bash .claude/skills/security-gate/scripts/check-secrets.sh"
---
```

### Skeleton

```markdown
---
name: [safety-skill]
description: Automatically [what it checks] before [trigger event]. [What it prevents].
user-invocable: false
allowed-tools: Read, Grep, Glob
hooks:
  PreToolUse:
    - matcher: "[tool-pattern]"
      hooks:
        - type: command
          command: "[validation-script]"
---

# [Safety Skill]

## What This Checks

This skill automatically validates:
- [Check 1]
- [Check 2]
- [Check 3]

## How It Works

1. Triggers before every [tool] operation
2. Runs [validation script/check]
3. Blocks the operation if [failure condition]
4. Allows if [success condition]

## What Gets Blocked

| Pattern | Why Blocked | Fix |
|---------|-------------|-----|
| [Dangerous pattern 1] | [Risk] | [How to fix] |
| [Dangerous pattern 2] | [Risk] | [How to fix] |

## False Positive Handling

If a legitimate operation is blocked:
1. [How to identify false positive]
2. [How to proceed safely]
```

### Supporting Files

- `scripts/` — Validation scripts (required for hook commands)

---

## 6. Dynamic Context Skill

**Purpose:** Injects live data (git state, PR info, issue details) and acts on it. The skill adapts to current state every time it runs.

**When to use:** PR review, issue fixing, changelog generation, any task where the skill needs fresh data from the environment.

**Key traits:** Dynamic context injection, arguments for targeting, may fork context.

### Frontmatter

```yaml
---
name: review-pr
description: Use when reviewing a pull request. Analyzes PR diff, comments, and checks.
argument-hint: "[pr-number]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash
---
```

### Skeleton

```markdown
---
name: [dynamic-skill]
description: Use when [trigger]. Analyzes [live data source].
argument-hint: "[identifier]"
disable-model-invocation: true
allowed-tools: [tools-needed]
---

# [Dynamic Skill]

## Current Context

[Section header for injected data]
!`[command to get live data]`

[Another data source]
!`[another command]`

## Your Task

Based on the context above:

1. [First analysis step]
2. [Second analysis step]
3. [Action to take]

## What to Look For

- [Pattern 1 in the live data]
- [Pattern 2]
- [Red flags]

## Output Format

[How to structure the response/action]

## Exit Criteria
- [ ] [Based on live data analysis]
- [ ] [Action completed]
```

### Supporting Files

- `scripts/` — Data extraction scripts for complex queries
- `criteria.md` — Detailed review criteria if needed

---

## Choosing the Right Archetype

| Your Skill Needs To... | Use This Archetype |
|------------------------|-------------------|
| Teach Claude how to think about a domain | **Reference** |
| Walk through a multi-step operation | **Task** |
| Explore codebase and report findings | **Research** |
| Create files or artifacts | **Generator** |
| Automatically validate before actions | **Safety** |
| Act on live/changing data | **Dynamic Context** |

**Hybrid skills** are common. A PR reviewer might combine Dynamic Context (live PR data) with Research (codebase exploration). Start with the primary archetype and add capabilities as needed.
