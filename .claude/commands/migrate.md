# /migrate Command

> Migrate existing Vibe System project from V9.x (JSON-based) to V10 (markdown-based)

## When to Use

- Existing project has `feature_list.json`
- Want to adopt V10 state management (IMPLEMENTATION_PLAN.md, the pin)
- Project may or may not have in-progress builds

## Prerequisites

Before running migration:
1. Commit all current work
2. Ensure no uncommitted changes
3. Know your current feature status

## Migration Steps

### Step 1: Pre-flight Check

```bash
# Verify we're in a Vibe project
[ -f "CLAUDE.md" ] || { echo "Not a Vibe project (no CLAUDE.md)"; exit 1; }

# Check for uncommitted changes
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "ERROR: Uncommitted changes detected. Commit first."
    exit 1
fi

# Backup current state
mkdir -p .migration-backup
cp feature_list.json .migration-backup/ 2>/dev/null
cp progress.md .migration-backup/ 2>/dev/null
echo "Backup created in .migration-backup/"
```

### Step 2: Detect Current State

```bash
# Check for in-progress build
IN_PROGRESS_FEATURE=""
if [ -f "feature_list.json" ]; then
    IN_PROGRESS_FEATURE=$(jq -r '.features[] | select(.status == "in_progress") | .id' feature_list.json 2>/dev/null | head -1)
fi

if [ -n "$IN_PROGRESS_FEATURE" ]; then
    echo "⚠️  In-progress feature detected: $IN_PROGRESS_FEATURE"
    echo "   Migration will preserve this state."
fi
```

### Step 3: Generate IMPLEMENTATION_PLAN.md

```bash
#!/bin/bash
# Creates IMPLEMENTATION_PLAN.md from feature_list.json

cat > IMPLEMENTATION_PLAN.md << 'HEADER'
# Implementation Plan

## Project Status

| Feature | Status | Phase | Spec |
|---------|--------|-------|------|
HEADER

# Parse each feature from JSON
if [ -f "feature_list.json" ]; then
    jq -r '.features[] | "| \(.id): \(.description // .name) | \(.status) | \(.current_phase // .phase_completed // 0) | docs/specs/\(.spec_file // "TBD") |"' feature_list.json >> IMPLEMENTATION_PLAN.md
else
    echo "| (no features yet) | — | — | — |" >> IMPLEMENTATION_PLAN.md
fi

# If there's an in-progress feature, add current feature section
IN_PROGRESS=$(jq -r '.features[] | select(.status == "in_progress")' feature_list.json 2>/dev/null)
if [ -n "$IN_PROGRESS" ]; then
    FEATURE_ID=$(echo "$IN_PROGRESS" | jq -r '.id')
    FEATURE_NAME=$(echo "$IN_PROGRESS" | jq -r '.description // .name')
    CURRENT_PHASE=$(echo "$IN_PROGRESS" | jq -r '.current_phase // 1')
    SPEC_FILE=$(echo "$IN_PROGRESS" | jq -r '.spec_file // "TBD"')

    cat >> IMPLEMENTATION_PLAN.md << EOF

## Current Feature: $FEATURE_ID $FEATURE_NAME

**Spec:** docs/specs/$SPEC_FILE
**Phase:** $CURRENT_PHASE

### Pending Tasks

- [ ] [Review progress.md and add pending tasks here]

### Completed Tasks

- [x] [Review progress.md and add completed tasks here]

### Learnings

- [Add operational discoveries here]
EOF
fi

echo "✓ Created IMPLEMENTATION_PLAN.md"
```

### Step 4: Generate specs/readme.md (The Pin)

```bash
#!/bin/bash
# Creates the project knowledge index

mkdir -p specs

cat > specs/readme.md << 'HEADER'
# Project Knowledge Index

> Load this first. Use keywords to find specs and source locations.

## Features

HEADER

# Generate entries from existing specs
if [ -d "docs/specs" ]; then
    for spec in docs/specs/*.spec; do
        [ -f "$spec" ] || continue
        name=$(basename "$spec" .spec)

        # Try to extract keywords from spec file (first line after # title)
        keywords=$(grep -i "keywords:" "$spec" 2>/dev/null | sed 's/.*keywords://i' | tr -d '\n')

        cat >> specs/readme.md << EOF
### $name
Keywords: ${keywords:-[TODO: add keywords]}
Spec: $spec
Source: [TODO: add source paths]
Tests: [TODO: add test paths]

EOF
    done
else
    echo "(No specs found. Add features here as you build them.)" >> specs/readme.md
fi

# Add conventions section
cat >> specs/readme.md << 'FOOTER'

## Conventions

- Components: `src/components/[domain]/[Name].tsx`
- API routes: `src/app/api/[resource]/route.ts`
- Database: `src/db/schema/[entity].ts`
- Tests: `__tests__/[domain]/[file].test.ts`

## Key Decisions

- [Document key architectural decisions here]
FOOTER

echo "✓ Created specs/readme.md"
```

### Step 5: Create Skill Index

```bash
#!/bin/bash
# Creates skill knowledge index if it doesn't exist

SKILL_INDEX=".claude/skills/INDEX.md"

if [ -f "$SKILL_INDEX" ]; then
    echo "⏭️  Skill index already exists, skipping"
else
    cat > "$SKILL_INDEX" << 'EOF'
# Skill Knowledge Index

> Find skills by phase or keyword. Load full content when needed.

## By Phase

| Phase | Skills |
|-------|--------|
| 1: Spec | spec, brainstorm |
| 2: Design | ux, ui, accessibility |
| 3: Architecture | database, architecture |
| 4: Build | tdd, frontend, backend, error-handling |
| 5: Verify | verification, changelog |

## By Keyword

| Need | Skill | Load |
|------|-------|------|
| UI components | ui | `cat .claude/skills/ui/SKILL.md` |
| Database schema | database | `cat .claude/skills/database/SKILL.md` |
| Testing/TDD | tdd | `cat .claude/skills/tdd/SKILL.md` |
| Bug fixing | debugging | `cat .claude/skills/debugging/SKILL.md` |
| Security | security | `cat .claude/skills/security/SKILL.md` |

## Always Consider

- **security** — For any auth, data handling, user input
- **accessibility** — For any UI work
- **error-handling** — For any user-facing code
EOF
    echo "✓ Created $SKILL_INDEX"
fi
```

### Step 6: Update CLAUDE.md with Learnings Section

Check if CLAUDE.md has a Learnings section. If not, append one:

```bash
if ! grep -q "## Learnings" CLAUDE.md 2>/dev/null; then
    cat >> CLAUDE.md << 'EOF'

## Learnings

*Operational discoveries — update as you build*

- [Add learnings here as you discover them]
EOF
    echo "✓ Added Learnings section to CLAUDE.md"
else
    echo "⏭️  Learnings section already exists in CLAUDE.md"
fi
```

### Step 7: Update progress.md Format

```bash
# Simplify progress.md to session-only state
if [ -f "progress.md" ]; then
    # Extract current phase info
    CURRENT_PHASE=$(grep -oP "Phase.*?:\s*\K\d+" progress.md | head -1)
    CURRENT_PHASE=${CURRENT_PHASE:-1}

    # Get feature ID if present
    FEATURE_ID=$(grep -oP "Feature.*?:\s*\K\S+" progress.md | head -1)
    FEATURE_ID=${FEATURE_ID:-"TBD"}

    # Create new simplified format
    cat > progress.md << EOF
# Session Progress

## Current Build

**Feature:** $FEATURE_ID
**Phase:** $CURRENT_PHASE
**Gate Status:** pending
**Gate Attempt:** 1

## Session Notes

- Migrated to V10 state management
- Review IMPLEMENTATION_PLAN.md for task history
EOF
    echo "✓ Simplified progress.md"
fi
```

### Step 8: Validate Migration

```bash
echo ""
echo "=== Migration Validation ==="

ERRORS=0

# Check IMPLEMENTATION_PLAN.md
if [ -f "IMPLEMENTATION_PLAN.md" ]; then
    echo "✓ IMPLEMENTATION_PLAN.md exists"
    FEATURE_COUNT=$(grep -c "^|" IMPLEMENTATION_PLAN.md | tail -1)
    echo "  Features found: $((FEATURE_COUNT - 2))"  # Subtract header rows
else
    echo "✗ IMPLEMENTATION_PLAN.md missing"
    ERRORS=$((ERRORS + 1))
fi

# Check pin
if [ -f "specs/readme.md" ]; then
    echo "✓ specs/readme.md (pin) exists"
else
    echo "✗ specs/readme.md (pin) missing"
    ERRORS=$((ERRORS + 1))
fi

# Check skill index
if [ -f ".claude/skills/INDEX.md" ]; then
    echo "✓ .claude/skills/INDEX.md exists"
else
    echo "✗ .claude/skills/INDEX.md missing"
    ERRORS=$((ERRORS + 1))
fi

# Check CLAUDE.md Learnings
if grep -q "## Learnings" CLAUDE.md 2>/dev/null; then
    echo "✓ CLAUDE.md has Learnings section"
else
    echo "✗ CLAUDE.md missing Learnings section"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo ""
    echo "=== Migration Successful ==="
else
    echo ""
    echo "=== Migration had $ERRORS errors ==="
fi
```

### Step 9: Cleanup (Manual)

After validating migration:

```bash
# Remove old JSON tracking
git rm feature_list.json

# Commit migration
git add IMPLEMENTATION_PLAN.md specs/readme.md .claude/skills/INDEX.md CLAUDE.md progress.md
git commit -m "chore: Migrate to V10 state management

- Replace feature_list.json with IMPLEMENTATION_PLAN.md
- Add specs/readme.md (project knowledge index)
- Add .claude/skills/INDEX.md (skill index)
- Add Learnings section to CLAUDE.md
- Simplify progress.md to session-only state"
```

---

## Rollback

If migration fails:

```bash
# Restore from backup
cp .migration-backup/feature_list.json .
cp .migration-backup/progress.md .
git checkout CLAUDE.md
rm -rf specs/readme.md IMPLEMENTATION_PLAN.md .claude/skills/INDEX.md

echo "Rolled back to pre-migration state"
```

---

## Post-Migration

After migration completes:

1. **Review IMPLEMENTATION_PLAN.md** — Fill in any TODO items for current feature
2. **Review specs/readme.md** — Add keywords and source paths
3. **Update hooks** — The Vibe System hooks need to be updated to parse markdown (this is a system-level change, not per-project)

---

## Edge Cases

### No feature_list.json

Project was never fully initialized. Creates empty IMPLEMENTATION_PLAN.md:

```markdown
## Project Status

| Feature | Status | Phase | Spec |
|---------|--------|-------|------|
| (no features yet) | — | — | — |
```

### Multiple in-progress features

Invalid state in V9. Migration takes first in-progress feature. Others become pending.

### No specs directory

Creates `specs/` with just readme.md. Features added as you build.

---

## Checklist

- [ ] Pre-flight check passed (no uncommitted changes)
- [ ] Backup created
- [ ] IMPLEMENTATION_PLAN.md generated
- [ ] specs/readme.md created
- [ ] .claude/skills/INDEX.md created
- [ ] CLAUDE.md Learnings section added
- [ ] progress.md simplified
- [ ] Validation passed
- [ ] feature_list.json removed
- [ ] Changes committed
