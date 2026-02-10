---
description: Help Claude understand an existing project after Vibe System installation
---

# /integrate - Project Integration

Establishes Claude's understanding of an existing project structure, patterns, and documentation.

**When to use:** After running `install-vibe.sh` on a complex existing project.

**When NOT to use:** For new projects (just use /build directly).

---

## Workflow

### Step 1: Validate Installation

Check that Vibe System is installed:

```bash
cat .claude/VERSION 2>/dev/null || echo "NOT INSTALLED"
```

If "NOT INSTALLED", tell the user:
```
❌ Vibe System not found.

Run: ./install-vibe.sh
Then try /integrate again.
```

### Step 2: Project Discovery

Read these files to understand the project:

**Package/Config Files:**
```bash
cat package.json 2>/dev/null | head -50
cat Cargo.toml 2>/dev/null | head -30
cat go.mod 2>/dev/null | head -20
cat requirements.txt 2>/dev/null | head -30
```

**Monorepo Detection:**
```bash
cat nx.json 2>/dev/null | head -20
cat turbo.json 2>/dev/null | head -20
cat pnpm-workspace.yaml 2>/dev/null
```

**Existing Documentation:**
```bash
cat CLAUDE.md 2>/dev/null | head -100
cat ARCHITECTURE.md 2>/dev/null | head -50
```

**Current State:**
```bash
ls -la .claude/commands/ 2>/dev/null
cat .mcp.json 2>/dev/null | head -30
cat feature_list.json 2>/dev/null
```

Present a summary:

```markdown
🔍 **Project Discovery**

**Project:** [name from package.json or directory]
**Type:** [Node.js / Python / Rust / Go / etc.]
**Monorepo:** [Nx / Turbo / PNPM Workspaces / No]

**Existing Documentation:**
- CLAUDE.md: [X lines / not found]
- ARCHITECTURE.md: [found / not found]

**Custom Configuration:**
- Commands: [list custom commands in .claude/commands/]
- MCPs: [list from .mcp.json if exists]

**State:**
- Features tracked: [count from feature_list.json]
- In-progress: [any with status "in_progress"]
```

### Step 3: Analyze Existing CLAUDE.md

If CLAUDE.md exists:

```bash
cat CLAUDE.md
```

Identify and list:
- Project description
- Tech stack
- Commands documented
- Conventions defined
- API notes
- Known issues

```markdown
📄 **Your CLAUDE.md Contains:**

- **Project:** [description]
- **Stack:** [framework, language, database, styling]
- **Commands:** [list]
- **Conventions:** [summary]
- **Special Notes:** [any API quirks, gotchas]
```

### Step 4: Offer Enhancement (Optional)

If CLAUDE.md exists but doesn't mention Vibe System:

```markdown
Would you like me to add a Vibe System reference to your CLAUDE.md?

This would append (at the bottom, after your content):

---

*This project uses [Vibe System V8.7](/.claude/SYSTEM.md). Run `/help` for commands.*

**Options:**
- ✅ Yes, add the reference
- ❌ No, leave CLAUDE.md as-is
```

**IMPORTANT:** Only APPEND. Never modify existing content.

If user approves, append ONLY this line:

```markdown

---

*This project uses [Vibe System V8.7](/.claude/SYSTEM.md). Run `/help` for commands.*
```

### Step 5: Initialize State Files (if needed)

If `feature_list.json` doesn't exist:

```bash
echo '{
  "project": "[project name]",
  "vibe_version": "8.7",
  "created_at": "'$(date -Iseconds)'",
  "features": []
}' > feature_list.json
```

If `progress.md` doesn't exist:

```bash
echo '# Build Progress

## Latest Session
**Date:** '$(date "+%B %d, %Y")'
**Status:** Vibe System integrated

---

*Run `/build "feature"` to start your first build.*
' > progress.md
```

### Step 6: Final Report

```markdown
╔═══════════════════════════════════════════════════════════════╗
║          ✅ Vibe System V8.7 Integration Complete             ║
╚═══════════════════════════════════════════════════════════════╝

**Project:** [name]
**Type:** [detected stack]

**PRESERVED (Your Files):**
✓ CLAUDE.md - [X lines, untouched / enhanced with reference]
✓ Custom commands - [list if any]
✓ MCP integrations - [list if any]

**INSTALLED (Vibe System):**
✓ .claude/SYSTEM.md - System documentation
✓ .claude/commands/ - 11 commands
✓ .claude/skills/ - 26 expert skills
✓ .claude/agents/ - 5 specialized agents
✓ .claude/hooks/ - Lifecycle automation

**STATE:**
✓ feature_list.json - [created / preserved]
✓ progress.md - [created / preserved]

**Backup:** .vibe-backup/[timestamp]/

---

**Try:** `/status` or `/build "your first feature"`
```

---

## What /integrate Does vs. Doesn't Do

| Does | Doesn't |
|------|---------|
| Validates Vibe System installation | Create ARCHITECTURE.md (that's /build's job) |
| Orients Claude THIS SESSION | Persist understanding across sessions |
| Creates state files if missing | Modify your code or project structure |
| Optionally adds Vibe reference to CLAUDE.md | Replace any existing content |

**For persistent project understanding:** Run `/build` on your first feature. The initializer agent creates `ARCHITECTURE.md` with discovered patterns that persist across sessions.
