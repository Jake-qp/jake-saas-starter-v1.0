# Skills Index

> Quick reference for discovering and loading the right skills. Skills are domain expertise that shape how Claude thinks about problems.

---

## By Workflow Phase

| Phase | Primary Skills | Supporting Skills | Auto-Consider |
|-------|---------------|-------------------|---------------|
| **1 - Spec** | `spec` | `brainstorm` | - |
| **2 - Design** | `ui` | `ux`, `accessibility` | accessibility |
| **3 - Data** | `database` | `architecture`, `backend` | - |
| **4 - Build** | `tdd` | `frontend`, `backend`, `error-handling` | security |
| **5 - Verify** | `verification` | `changelog` | - |

---

## By Trigger

When the user says... load these skills:

| Trigger Phrase | Primary Skill | Supporting |
|----------------|---------------|------------|
| "new feature", "build this", "I want to create" | `spec` | - |
| "feels off", "something's wrong with UX" | `ux` | - |
| "make it look good", "design system", "components", "shadcn" | `ui` | `accessibility` |
| "database", "schema", "data model" | `database` | - |
| "API", "endpoint", "backend" | `backend` | `security` |
| "React", "component", "frontend", "UI code" | `frontend` | `ui` |
| "test", "TDD", "coverage" | `tdd` | `testing` |
| "QA", "find bugs", "test everything", "verify it works" | `test` | - |
| "connect to", "integrate with", "external API" | `integration` | - |
| "it's slow", "performance", "optimize" | `performance` | - |
| "bug", "error", "not working" | `debugging` | - |
| "login", "auth", "permissions", "security" | `security` | - |
| "deploy", "CI/CD", "infrastructure" | `devops` | - |
| "GDPR", "compliance", "regulations" | `compliance` | - |
| "mobile", "responsive", "touch" | `mobile` | - |
| "documentation", "README", "docs" | `documentation` | - |

---

## Always Consider

These skills should be evaluated for **every feature**:

| Skill | Why Always Consider |
|-------|---------------------|
| `security` | Auth, input validation, data protection - security is not optional |
| `accessibility` | WCAG compliance, keyboard nav - accessibility is a requirement |
| `error-handling` | Graceful failures, user messages - errors always happen |

---

## Skill Combinations

Common multi-skill workflows:

| Task | Load In Order |
|------|---------------|
| **New React Component** | `ui` → `frontend` → `tdd` |
| **New API Endpoint** | `backend` → `database` → `tdd` → `security` |
| **Bug Fix** | `debugging` → `tdd` |
| **Post-Build QA** | `test` (loop: find → test → fix) |
| **Performance Issue** | `performance` → (then targeted skill based on findings) |
| **External Integration** | `integration` → `backend` → `testing` |
| **New Full Feature** | `spec` → `ui` → `database` → `tdd` |
| **Complex Multi-Feature** | `prd` → then `/build` each child feature |

---

## Available Skills

### Planning & Requirements
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `spec` | Capture requirements, create alignment | Decision |
| `brainstorm` | Explore vague ideas before specification | None |
| `prd` | Complex multi-feature strategic documents | Decision |
| `implementation-plan` | Break features into shippable tasks | None |

### Design & UX
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `ui` | shadcn/ui components, semantic tokens, theming (90%+ token savings) | Decision |
| `ux` | User flows, information architecture | Decision |
| `accessibility` | WCAG compliance, keyboard nav, screen readers | None |

### Architecture & Data
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `architecture` | API design, data models, system contracts | Decision |
| `database` | Schema design, queries, migrations | Decision |

### Implementation
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `frontend` | React components, state, data fetching | Verification |
| `backend` | APIs, business logic, validation | Verification |
| `tdd` | Test-driven development, RED-GREEN-REFACTOR | Verification |
| `error-handling` | Graceful failures, user messages | None |

### Quality & Security
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `test` | Post-implementation QA loop: find bugs, write tests, fix | None |
| `testing` | Test strategies, E2E, integration tests | Verification |
| `security` | Auth, authorization, OWASP top 10 | None |
| `performance` | Optimization, profiling, metrics | None |
| `debugging` | Hypothesis-driven bug investigation | None |

### Operations & Integration
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `verify-api` | Verify external APIs before building | None |
| `integration` | External APIs, resilience patterns | None |
| `devops` | CI/CD, deployment, infrastructure | None |
| `compliance` | GDPR, PCI DSS, regulated industries | None |
| `mobile` | Touch-first, offline-ready, responsive | None |

### Documentation
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `verification` | Phase 5 completion evidence | Verification |
| `changelog` | Document changes in narrative form | None |
| `documentation` | READMEs, API docs, runbooks | None |

### Meta
| Skill | Purpose | Gate Type |
|-------|---------|-----------|
| `skill-creator` | Create new reusable skills | None |

---

## Loading Skills

```bash
# Load a skill
cat .claude/skills/[skill]/SKILL.md

# Examples
cat .claude/skills/spec/SKILL.md
cat .claude/skills/tdd/SKILL.md
cat .claude/skills/security/SKILL.md
```

---

## Skills vs Commands

| Type | Purpose | Invocation |
|------|---------|------------|
| **Skills** | Domain expertise - shapes HOW Claude thinks | `cat .claude/skills/[skill]/SKILL.md` |
| **Commands** | Workflow shortcuts - orchestrates WHAT Claude does | `/build`, `/quick`, `/fix`, etc. |

Commands load skills automatically at appropriate phases. See `.claude/commands/` for command documentation.

---

## Skill Metadata

Each skill includes YAML frontmatter in `SKILL.md`. These are the valid Claude Code fields:

```yaml
---
name: skill-name                      # Display name / slash command (kebab-case)
description: When to use this skill   # TRIGGER-ONLY — say when, not how (~200 chars)
# All fields below are optional — only add what the skill needs:
argument-hint: "[args]"               # Autocomplete hint shown after /name
disable-model-invocation: true        # Set true → manual /name only (default: false)
user-invocable: false                 # Set false → hidden from /menu, Claude-only (default: true)
allowed-tools: Read, Grep, Glob       # Tool allowlist — restricts to listed tools only
context: fork                         # Set to "fork" → runs in isolated subagent
agent: Explore                        # Agent type when forked: Explore, Plan, general-purpose
model: sonnet                         # Override model: sonnet, opus, haiku
---
```

Skills can also include supporting files (`reference.md`, `examples.md`, etc.) and a `scripts/` directory in the same folder. See `skill-creator` skill for full documentation.

---

*Last updated: 2026-02-10 | Vibe System V10*
