# ADR-005: MDX for Blog and Legal Content
**Status:** Accepted
**Date:** 2026-02-10

## Context
The boilerplate needs a blog, changelog, and legal pages (ToS, Privacy Policy, Cookie Policy). Options: headless CMS (Contentful, Sanity), MDX files in repo, database-backed content.

## Decision
Use MDX files in the `content/` directory, processed at build time via `@next/mdx` or `contentlayer2`. Blog posts in `content/blog/`, changelog entries in `content/changelog/`, legal templates in `content/legal/`.

## Consequences
- Zero runtime cost — content is statically generated at build time
- Content lives in the repo — version controlled, reviewable in PRs
- No external CMS dependency — simpler setup for boilerplate users
- Developers can swap to a CMS later if needed (the page structure remains the same)
- Adding content requires a code deploy — acceptable for a boilerplate's blog/changelog
- Legal page templates are customizable MDX — developers fill in their company details
