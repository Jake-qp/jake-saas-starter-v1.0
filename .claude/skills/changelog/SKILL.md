---
name: changelog
description: Use after completing features, bug fixes, or any meaningful code changes. Maintains CHANGELOG.md as a living record of what changed and why.
---

# Changelog Skill

## Overview

A changelog is a letter to your future self. Six months from now, when something breaks or someone asks "why does it work this way?"—the changelog answers. It's not a git log dump. It's the curated story of how your product evolved.

## How Engineering Managers Think

**"Would someone understand this in 6 months?"**
Changelogs aren't for today—they're for the future. Write for someone who wasn't there, doesn't have context, and needs to understand what happened. If the entry requires reading the code to understand, it's not good enough.

**"Is this written for the reader, not the writer?"**
Developers write "refactored auth module." Users need "Login now remembers your session for 30 days." The audience determines the language. Internal changelogs can be technical. User-facing changelogs must be human.

**"Can I trace this back to the work?"**
Every changelog entry should connect to something—a feature request, a bug report, a decision. When someone asks "why did we do this?"—the changelog points to the answer.

### What Separates Amateurs from Professionals

Amateurs dump git commits into a file.
Professionals curate meaningful changes into a narrative.

The amateur writes: "Fixed bug in user.js"
The professional writes: "Fixed: Users were logged out unexpectedly when switching between tabs"

When catching yourself writing changelog entries that require code knowledge to understand—STOP. Rewrite for humans.

## When to Use

- After completing a feature (end of BUILD phase)
- After fixing a bug
- After any breaking change
- After adding/removing dependencies
- After API changes
- **EVERY session that produces working changes**
- **NOT** for work-in-progress or abandoned changes

## The Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com) format:

```markdown
# Changelog

All notable changes to this project are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- New features that didn't exist before

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Removed
- Features or capabilities that were removed

### Security
- Security-related changes

### Breaking
- Changes that break backward compatibility

---

## [1.2.0] - 2024-01-15

### Added
- Project budget tracking with visual indicators
- Export projects to CSV

### Fixed
- Users were logged out when switching tabs
- Dashboard failed to load with more than 100 projects

---

## [1.1.0] - 2024-01-08
...
```

## Writing Good Entries

### The Entry Formula

```
[Action]: [What changed] [User impact if not obvious]
```

### Examples by Category

**Added:**
```markdown
- User authentication with email/password
- Project dashboard showing budget status
- Export functionality for reports (CSV, PDF)
- Dark mode support
```

**Changed:**
```markdown
- Project list now loads 50 items per page (was 20)
- Login session extended to 30 days (was 7 days)
- API rate limit increased to 1000 requests/hour
```

**Fixed:**
```markdown
- Fixed: Dashboard crashed when project had no tasks
- Fixed: Email notifications sent duplicate messages
- Fixed: Search failed for projects with special characters
```

**Removed:**
```markdown
- Removed legacy v1 API endpoints (deprecated since 1.0)
- Removed support for IE11
```

**Security:**
```markdown
- Updated authentication to require HTTPS
- Added rate limiting to prevent brute force attacks
- Fixed XSS vulnerability in comment rendering
```

**Breaking:**
```markdown
- BREAKING: API endpoint changed from /api/users to /api/v2/users
- BREAKING: Minimum Node.js version is now 18 (was 16)
- BREAKING: Database migration required (see MIGRATION.md)
```

## Entry Quality Checklist

| ❌ Bad Entry | ✅ Good Entry | Why |
|--------------|---------------|-----|
| "Fixed bug" | "Fixed: Login failed for emails with + symbol" | Specific, searchable |
| "Updated dependencies" | "Updated React to v18 for concurrent features" | Explains why |
| "Refactored auth" | "Changed: Auth tokens now expire after 24 hours" | User-visible impact |
| "Added stuff" | "Added: Bulk delete for projects" | Clear feature |
| "Breaking change" | "BREAKING: /api/v1/* endpoints removed, use /api/v2/*" | Migration path clear |

## The Changelog Workflow

### After Each Meaningful Change

1. **Identify the category** (Added/Changed/Fixed/Removed/Security/Breaking)
2. **Write for the audience** (technical for internal, human for user-facing)
3. **Add to [Unreleased] section**
4. **Include context** if non-obvious

### On Release

1. **Move [Unreleased] to new version section**
2. **Add version number and date**
3. **Create fresh [Unreleased] section**
4. **Tag in git** to match version

```markdown
## [Unreleased]
(empty - ready for next changes)

## [1.3.0] - 2024-01-20

### Added
- (entries moved from Unreleased)
```

## Changelog for Vibe Coders

For AI-assisted development, changelogs serve extra purposes:

### What to Capture

| Change Type | Changelog Entry |
|-------------|-----------------|
| New feature built | Added: [Feature description] |
| Bug fixed | Fixed: [What was broken and how it manifested] |
| File structure changed | Changed: [What moved and why] |
| Database schema updated | Changed: [Schema change] - migration required |
| API added/changed | Added/Changed: [Endpoint] - [what it does] |
| Dependency added | Added: [Package] for [purpose] |
| Breaking change | BREAKING: [What broke and migration path] |

### Session Markers (Optional)

For overnight batch processing, consider session markers:

```markdown
## [Unreleased]

### Session: 2024-01-20 (overnight batch)

#### Added
- Complete user dashboard with charts
- Settings page with preference management
- Email notification system

#### Changed
- Migrated from REST to tRPC for type safety
- Database schema updated for multi-tenancy
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| New feature complete | Add to "Added" section |
| Bug fixed | Add to "Fixed" section with symptom description |
| Behavior changed | Add to "Changed" section |
| Breaking change | Add to "Breaking" with migration notes |
| Security fix | Add to "Security" section |
| Ready to release | Move Unreleased to versioned section |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Git commits as changelog | Curated, meaningful entries | Commits are noise; changelog is signal |
| "Fixed bugs" | Specific bug descriptions | Future debugging needs specifics |
| Technical jargon for users | Plain language | Audience determines language |
| Forgetting breaking changes | BREAKING prefix, prominent | Users need migration warning |
| Updating only on release | Update as you go | Memory fades; capture in the moment |
| No dates | Dates on every version | Timeline matters for debugging |

## File Location

```
project-root/
├── CHANGELOG.md    ← Lives at project root
├── package.json
├── src/
└── ...
```

## Exit Criteria

- [ ] CHANGELOG.md exists at project root
- [ ] Follows Keep a Changelog format
- [ ] [Unreleased] section exists for ongoing work
- [ ] Every meaningful change has an entry
- [ ] Breaking changes prominently marked
- [ ] Entries are human-readable (not commit messages)
- [ ] Dates included on released versions
- [ ] Can answer "what changed in the last session?"

**Done when:** Someone who wasn't in the coding session can read the changelog and understand what was built, what changed, and what might break—without looking at a single line of code.
