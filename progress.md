# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-013
**Date:** 2026-02-11

Blog & Changelog (MDX) — 21 new tests, 11/11 ACs.

**Files Created:**
- `content/blog/*.mdx` (2 sample blog posts)
- `content/changelog/*.mdx` (3 changelog entries)
- `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/blog/layout.tsx`
- `app/blog/feed.xml/route.ts` (RSS feed)
- `app/changelog/page.tsx`, `app/changelog/layout.tsx`, `app/changelog/ChangelogSubscribeForm.tsx`
- `app/changelog/unsubscribe/page.tsx`
- `components/WhatsNewBadge.tsx`
- `lib/content.ts`, `lib/rss.ts`, `lib/changelog.ts`
- `convex/changelog.ts`

**Files Modified:**
- `convex/schema.ts` (changelogSubscribers table, users.lastSeenChangelogDate)
- `app/t/[teamSlug]/layout.tsx` (added WhatsNewBadge)
- `app/(marketing)/layout.tsx` (Blog/Changelog nav + footer links)

**Key Implementation:**
- MDX content processing via `gray-matter` + `next-mdx-remote`
- RSS 2.0 feed generation at `/blog/feed.xml`
- Convex mutations for changelog subscribe/unsubscribe
- WhatsNewBadge compares user's lastSeenChangelogDate with latest changelog entry

**Spec:** `docs/specs/F001-013-blog-changelog.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 411 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 15 complete | 2 pending
