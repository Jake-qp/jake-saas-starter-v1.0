# Claude Code Skill Capabilities Reference

Complete documentation of all Claude Code skill infrastructure. Load this when you need details about a specific capability during skill creation.

---

## Frontmatter Field Reference

Every `SKILL.md` starts with YAML frontmatter between `---` delimiters. These are ALL valid fields:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | directory name | Display name and slash command. Kebab-case, max 64 chars. |
| `description` | string | first paragraph | Trigger for auto-invocation. Say WHEN to use, not HOW. ~200 chars ideal. |
| `argument-hint` | string | none | Autocomplete hint shown after `/name`. Example: `[issue-number]` |
| `disable-model-invocation` | boolean | `false` | When `true`, only manual `/name` invocation works. Claude cannot auto-invoke. |
| `user-invocable` | boolean | `true` | When `false`, hidden from `/` menu. Only Claude can invoke via Skill tool. |
| `allowed-tools` | string | all tools | Comma-separated allowlist of tools. Claude can ONLY use listed tools. |
| `context` | string | none | Set to `fork` to run in isolated subagent context. |
| `agent` | string | `general-purpose` | Agent type when `context: fork`. Options: `Explore`, `Plan`, `general-purpose`. |
| `model` | string | inherit | Override model: `sonnet`, `opus`, `haiku`, or `inherit`. |
| `hooks` | object | none | Skill-scoped hook definitions (nested YAML). |

**Fields that DO NOT exist** (commonly invented — Claude Code silently ignores them):
`version`, `category`, `phase`, `triggers`, `requires`, `gate_type`, `priority`, `author`, `tags`

---

## Dynamic Context Injection

Inject live shell command output into skill content using backtick syntax. Commands execute when the skill loads, BEFORE Claude sees the content.

### Syntax

```
!`command`
```

- Must use backticks (not single/double quotes)
- Command executes immediately on skill load
- Output replaces the entire `` !`command` `` placeholder
- Multiple injections supported — each executes in order
- Pipes and shell features work: `` !`git log --oneline | head -5` ``
- Works in markdown body only, NOT in frontmatter

### Examples

```markdown
## Current State
- Branch: !`git branch --show-current`
- Recent changes: !`git log --oneline -5`
- Modified files: !`git diff --name-only`
```

```markdown
## PR Context
- PR diff: !`gh pr diff`
- PR description: !`gh pr view --json body -q .body`
- Changed files: !`gh pr diff --name-only`
```

```markdown
## Issue Details
Issue #$ARGUMENTS details:
!`gh issue view $ARGUMENTS --json title,body,labels -q '"\(.title)\n\(.body)\nLabels: \(.labels | map(.name) | join(", "))"'`
```

### When to Use

- Git state (branch, diff, log, status)
- GitHub context (PR info, issue details, review comments)
- Project metadata (package.json version, dependency list)
- Environment info (Node version, available tools)

### When NOT to Use

- Static information that doesn't change (put it directly in the skill)
- Slow commands (>5s) — they block skill loading
- Commands that require user interaction

---

## String Substitutions

Skills support dynamic value replacement in content:

| Variable | Description | Example |
|----------|-------------|---------|
| `$ARGUMENTS` | All arguments passed to the skill | `/fix login bug` → `$ARGUMENTS` = `login bug` |
| `$ARGUMENTS[0]` | First argument (0-indexed) | `/migrate Foo React Vue` → `Foo` |
| `$0`, `$1`, `$2` | Shorthand for `$ARGUMENTS[N]` | `/migrate Foo React Vue` → `$0`=`Foo`, `$1`=`React` |
| `${CLAUDE_SESSION_ID}` | Current session ID | Useful for temp files, logging |

**Behavior rules:**
- If `$ARGUMENTS` appears in content → it gets replaced inline
- If `$ARGUMENTS` does NOT appear → Claude Code appends `ARGUMENTS: <value>` to the end
- Empty arguments resolve to empty strings
- Works inside `` !`command` `` — e.g., `` !`gh issue view $ARGUMENTS` ``

### Example

```markdown
---
name: fix-issue
argument-hint: "[issue-number]"
---

Fix issue #$ARGUMENTS:

Context: !`gh issue view $ARGUMENTS --json title,body -q '"\(.title): \(.body)"'`

1. Understand the issue above
2. Find relevant code
3. Implement the fix
4. Write tests
```

When invoked as `/fix-issue 42`, `$ARGUMENTS` becomes `42` everywhere.

---

## Context Forking

Setting `context: fork` runs the skill in an isolated subagent instead of inline in your conversation.

### What Happens

1. New isolated context window created
2. Skill content becomes the subagent's prompt
3. Subagent has NO access to conversation history
4. CLAUDE.md IS loaded into the subagent
5. Results summarized and returned to main conversation

### Agent Types

| Agent | Tools Available | Model | Best For |
|-------|----------------|-------|----------|
| `Explore` | Read, Glob, Grep | Haiku | Fast codebase research, code analysis |
| `Plan` | Read, Glob, Grep | Sonnet | Gathering context, designing approaches |
| `general-purpose` | All tools | Inherit | Full-capability isolated tasks |

### When to Fork

- **Fork:** Explicit task with clear deliverable (research report, code analysis, file generation)
- **Don't fork:** Guidelines, conventions, mental models (these need conversation context)
- **Fork:** Task that would pollute main context with large tool outputs
- **Don't fork:** Skill that needs to reference what the user just said

### Example

```yaml
---
name: codebase-audit
description: Audit codebase for patterns, issues, and improvement opportunities
context: fork
agent: Explore
argument-hint: "[area-to-audit]"
---

Audit the codebase focusing on: $ARGUMENTS

1. Find all relevant files with Glob
2. Search for patterns with Grep
3. Read key files
4. Report findings with file:line references
```

---

## Tool Access Control

The `allowed-tools` field restricts which tools Claude can use when a skill is active.

### Syntax

Comma or space-separated tool names:

```yaml
allowed-tools: Read, Grep, Glob
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
```

### Available Tool Names

```
Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch,
Task, AskUserQuestion, Skill, [MCP tool names]
```

### Common Patterns

| Pattern | Tools | Use Case |
|---------|-------|----------|
| Read-only | `Read, Grep, Glob` | Research, audit, analysis |
| Edit-capable | `Read, Write, Edit, Grep, Glob` | Code generation, refactoring |
| Full with web | `Read, Write, Edit, Grep, Glob, Bash, WebFetch, WebSearch` | Skills that need external info |
| Bash-restricted | `Read, Grep, Glob, Bash` | Skills that run scripts |

### Important Notes

- This is an **allowlist** — Claude can ONLY use listed tools
- User's global permission settings still apply as baseline
- When not set, all tools available (subject to permissions)
- Tool restrictions apply for the duration of the skill invocation

---

## Skill-Scoped Hooks

Skills can define hooks that run only while the skill is active. Defined in frontmatter YAML.

### Structure

```yaml
---
name: safe-deploy
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "./scripts/lint-check.sh"
---
```

### Supported Events

| Event | When It Fires | Can Block? |
|-------|---------------|------------|
| `PreToolUse` | Before tool execution | Yes (exit code 2) |
| `PostToolUse` | After successful tool execution | No |
| `PostToolUseFailure` | After tool failure | No |
| `UserPromptSubmit` | When user submits prompt | No |
| `Stop` | When skill finishes | No |

### Hook Types

| Type | Description |
|------|-------------|
| `command` | Run a shell command. Exit 0 = allow, exit 2 = block. |
| `prompt` | Run an LLM prompt for evaluation. |
| `agent` | Run a subagent for complex evaluation. |

### Matcher Syntax

- Tool names: `"Bash"`, `"Write"`, `"Edit"`
- Multiple: `"Write|Edit"` (regex OR)
- All: `"*"` or omit matcher

### Blocking Example

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "echo 'Checking...' && ./scripts/safety-check.sh"
```

If `safety-check.sh` exits with code 2, the Bash tool call is blocked.

---

## Script Bundling

Skills can include executable scripts in a `scripts/` subdirectory.

### Directory Layout

```
my-skill/
├── SKILL.md
├── reference.md
└── scripts/
    ├── analyze.sh
    ├── validate.py
    └── generate-report.js
```

### How Scripts Work

- Scripts are NOT loaded into context — they're executed via Bash
- Make executable: `chmod +x scripts/analyze.sh`
- Reference with relative paths from project root or absolute paths
- Can be called from skill content or from hooks

### Example Usage in Skill Content

```markdown
Run the analysis script:
bash .claude/skills/my-skill/scripts/analyze.sh $ARGUMENTS
```

### Example Usage in Hooks

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bash .claude/skills/my-skill/scripts/validate.sh"
```

---

## Supporting Files & Progressive Loading

Skills can include multiple `.md` files. Only `SKILL.md` loads automatically.

### Pattern

```
my-skill/
├── SKILL.md          # Always loaded (keep under 500 lines)
├── reference.md      # Loaded when Claude needs details
├── examples.md       # Loaded when Claude needs examples
├── templates.md      # Loaded when Claude needs templates
└── conventions.md    # Loaded for project-specific rules
```

### How to Reference

From SKILL.md, use markdown links:

```markdown
For detailed API reference, see [reference.md](reference.md).
For examples of each pattern, see [examples.md](examples.md).
```

Claude reads these files when it needs the information — not upfront.

### Best Practices

- SKILL.md: Core workflow, decision framework, mental models (~300-500 lines)
- Supporting files: Reference material, examples, templates (~200-300 lines each)
- Never duplicate content between files — reference, don't copy
- Name files descriptively: `conventions.md` > `extra.md`

---

## Skill Locations & Scope

Skills are discovered from multiple locations with priority ordering:

| Location | Path | Scope | Priority |
|----------|------|-------|----------|
| Project | `.claude/skills/<name>/SKILL.md` | Current repo | High |
| User | `~/.claude/skills/<name>/SKILL.md` | All projects | Medium |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where enabled | Low |

When skills share names, higher priority wins. Plugin skills use namespacing (`plugin-name:skill-name`).

**Project skills** are version-controlled and shared with the team.
**User skills** are personal and available everywhere.

---

## Invocation Control Matrix

| Config | User Can Invoke | Claude Can Auto-Invoke | Claude Can Use Skill Tool |
|--------|----------------|----------------------|--------------------------|
| Default (no flags) | Yes | Yes | Yes |
| `disable-model-invocation: true` | Yes | No | No |
| `user-invocable: false` | No | Yes | Yes |
| Both flags | No | No | No (useless) |

### Choosing Invocation Mode

- **Default:** Knowledge skills, coding standards, guidelines — invoke whenever relevant
- **`disable-model-invocation: true`:** Dangerous operations (deploy, publish), tasks requiring explicit intent
- **`user-invocable: false`:** Background knowledge Claude should have but users don't need to manually trigger

---

## Performance Best Practices

1. **Keep SKILL.md under 500 lines** — Claude's attention degrades in long files
2. **Use supporting files** for reference material — only loaded when needed
3. **Avoid slow `` !`command` ``** — commands that take >5s block skill loading
4. **Restrict tools** when possible — fewer tools = faster, more focused execution
5. **Use `context: fork`** for heavy research — keeps main context clean
6. **Use `agent: Explore` with Haiku** for read-only tasks — faster and cheaper
7. **Don't over-configure** — a simple skill with just `name` + `description` is perfectly valid
