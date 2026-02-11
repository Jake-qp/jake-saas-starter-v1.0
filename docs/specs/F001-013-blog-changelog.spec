# Feature: Blog & Changelog (F001-013)

## User Context
- **Primary User:** Marketing visitor (blog) / Existing app user (changelog + What's New badge)
- **Context:** Desktop/mobile web browser — public pages for blog/changelog, in-app header for badge
- **Top Goals:**
  1. Read blog posts with proper MDX typography
  2. See product changelog in reverse chronological order
  3. Get notified (badge / email) when new changelog entries are published
- **Mental Model:** Blog = content marketing; Changelog = product update log; What's New = in-app notification dot
- **Key Questions:** What's new in the product? What blog posts are available?

## Feature Outline (Approved)

### Screens
1. **Blog Listing** (`/blog`) — All blog posts sorted by date, with title/date/description
2. **Blog Post** (`/blog/[slug]`) — Individual MDX post with prose typography
3. **Changelog Listing** (`/changelog`) — Entries in reverse chronological order with email subscription form
4. **RSS Feed** (`/blog/feed.xml`) — Auto-generated RSS 2.0 feed
5. **WhatsNewBadge** — Dot indicator in app header, links to changelog

### Key User Flows
1. Visitor browses `/blog` → clicks post → reads MDX content with proper typography
2. Visitor browses `/changelog` → subscribes email → sees confirmation (or "already subscribed")
3. Subscriber clicks unsubscribe link in email → removed from list
4. Logged-in user sees dot on WhatsNewBadge → clicks → opens changelog → dot dismissed

### Out of Scope
- Blog comments or reactions
- Blog search / filtering by tag
- Blog pagination (all posts on one page)
- Email sending on new changelog entry (infrastructure only — subscriber storage + unsubscribe)
- Blog author profiles

## User Story
As a visitor, I want to read blog posts and product changelog so that I stay informed about the product.
As a logged-in user, I want a "What's New" badge so that I notice new product updates.

## Acceptance Criteria
- [x] AC1: Blog listing page shows all posts sorted by date
- [x] AC2: Individual blog posts render MDX content with proper typography
- [x] AC3: Changelog page shows entries in reverse chronological order
- [x] AC4: MDX frontmatter validates at build time (title, date, description required)
- [x] AC5: Blog and changelog pages are statically generated at build time
- [x] AC6: RSS feed is generated at `/blog/feed.xml`
- [x] AC7: Visitors can subscribe to changelog updates via email (stored in `changelogSubscribers` table)
- [x] AC8: Duplicate changelog email subscription shows "already subscribed" message
- [x] AC9: Subscribers can unsubscribe via link in changelog email
- [x] AC10: `<WhatsNewBadge>` in app header shows dot indicator when new changelog entries exist since user last dismissed
- [x] AC11: Clicking the badge opens the changelog; dismissing updates user's last-seen timestamp

## Edge Cases
- Empty blog (no MDX files): Blog listing shows EmptyState
- Empty changelog (no MDX files): Changelog listing shows EmptyState
- Invalid email on subscribe: Form validation error
- Already subscribed email: Shows "already subscribed" message (not an error)
- Unsubscribe with invalid/expired token: Shows friendly error
- No new changelog entries since last dismissed: Badge dot hidden
- MDX file missing required frontmatter: Build-time error

## Success Definition
We'll know this works when: Blog and changelog pages render MDX content correctly, RSS feed is valid XML, email subscription CRUD works, and WhatsNewBadge shows/hides dot correctly.
