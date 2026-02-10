# Skill Knowledge Index

> Lightweight index for V10. Load this first, then specific skills as needed.
> For full documentation: `cat .claude/skills/SKILLS-INDEX.md`

## By Phase

| Phase | Primary Skill | Load Command |
|-------|---------------|--------------|
| 1: Spec | spec | `cat .claude/skills/spec/SKILL.md` |
| 2: Design | ui | `cat .claude/skills/ui/SKILL.md` |
| 3: Architecture | database | `cat .claude/skills/database/SKILL.md` |
| 4: Build | tdd | `cat .claude/skills/tdd/SKILL.md` |
| 5: Verify | verification | `cat .claude/skills/verification/SKILL.md` |

## By Keyword

| Keywords | Skill |
|----------|-------|
| component, shadcn, tailwind, styling | ui |
| flow, journey, wireframe | ux |
| wcag, a11y, keyboard, screenreader | accessibility |
| schema, migration, postgres, drizzle | database |
| api, endpoint, route, handler | backend |
| react, state, hook, component | frontend |
| test, tdd, jest, coverage | tdd |
| error, catch, fallback, boundary | error-handling |
| bug, debug, fix, broken | debugging |
| auth, xss, injection, secure | security |
| slow, optimize, performance | performance |
| deploy, ci, cd, infrastructure | devops |
| changelog, release, notes | changelog |

## Always Consider

Load these for ANY feature work:

- **security** — Auth, input validation, data protection
- **accessibility** — WCAG compliance, keyboard navigation
- **error-handling** — Graceful failures, user feedback

## Quick Combos

| Task | Skills (in order) |
|------|-------------------|
| New Component | ui → frontend → tdd |
| New API | backend → database → tdd |
| Bug Fix | debugging → tdd |
| Full Feature | spec → ui → database → tdd |
