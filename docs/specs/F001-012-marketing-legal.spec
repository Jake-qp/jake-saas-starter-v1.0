# Feature: Marketing Site & Legal Pages (F001-012)

## PRD Anchor
**Feature:** F001-012
**Source:** docs/prds/F001-saas-boilerplate-v2.md
**Extract:** `sed -n '/<!-- START_FEATURE: F001-012 -->/,/<!-- END_FEATURE: F001-012 -->/p' docs/prds/F001-saas-boilerplate-v2.md`

## User Context
- **Primary User:** Prospective customer (visitor who hasn't signed up yet)
- **Context:** Desktop/mobile browser, browsing from search/referral link
- **Top Goals:**
  1. Understand the product and its value proposition at a glance
  2. Compare pricing plans and choose the right one
  3. Access legal/compliance docs (terms, privacy, cookies)
- **Mental Model:** Standard SaaS marketing site — hero → features → pricing → FAQ → CTA
- **Key Questions:** What does this do? How much does it cost? Can I trust this company?

## Feature Outline (Auto-Approved from PRD)

### Screens
1. **Landing Page** (`/`) — Hero section, features grid, pricing table, FAQ accordion, CTA section
2. **Pricing Page** (`/pricing`) — Standalone pricing comparison page with plan details
3. **Contact Page** (`/contact`) — Contact form with validation, sends email via Resend
4. **Terms of Service** (`/legal/terms`) — MDX-rendered legal content
5. **Privacy Policy** (`/legal/privacy`) — MDX-rendered legal content
6. **Cookie Policy** (`/legal/cookies`) — MDX-rendered legal content

### Key User Flows
1. **Discover Product:** Visitor lands on `/` → reads hero → scrolls features → sees pricing → clicks CTA to sign up
2. **Compare Plans:** Visitor goes to `/pricing` → compares tiers auto-populated from planConfig → clicks plan CTA
3. **Contact Support:** Visitor goes to `/contact` → fills out validated form → form sends email via Resend → success confirmation
4. **Review Legal:** Visitor clicks footer link → reads terms/privacy/cookies rendered from MDX content

### Out of Scope
- Blog & changelog (F001-013)
- Authentication integration on marketing pages (separate feature)
- Waitlist/pre-launch mode (F001-015)
- Payment processing (F001-003, already done)

## User Story
As a prospective customer
I want to see a professional marketing site with pricing, features, and legal pages
So that I can evaluate the product and understand its terms before signing up

## Acceptance Criteria (from PRD)
- [ ] AC1: Landing page renders with hero, features grid, pricing table, FAQ, and CTA sections
- [ ] AC2: PricingTable auto-populates from `planConfig.ts` and highlights recommended plan
- [ ] AC3: `/pricing` page works as standalone pricing comparison
- [ ] AC4: `/contact` form validates input and sends email via Resend
- [ ] AC5: `/legal/terms`, `/legal/privacy`, `/legal/cookies` render MDX content correctly
- [ ] AC6: Marketing pages are fully responsive (mobile/tablet/desktop)
- [ ] AC7: Marketing layout has distinct nav/footer from authenticated app layout

## Implementation Notes (from PRD)
- Landing page: HeroSection, FeaturesGrid, PricingTable, FAQAccordion, CTASection
- PricingTable auto-populated from `planConfig.ts`
- `/pricing` dedicated pricing page
- `/contact` form with Resend integration
- `/legal/terms`, `/legal/privacy`, `/legal/cookies` (MDX templates)
- Marketing layout with nav + footer

## Edge Cases
- Empty/missing plan config: Gracefully handle, show fallback
- Contact form: Rate limit submissions, validate email format, handle Resend API errors
- MDX content: Handle missing MDX file gracefully with 404
- Responsive: Ensure pricing cards stack vertically on mobile
- Long legal content: Ensure proper scrolling and navigation

## Technical Dependencies
- `planConfig.ts` (F001-003, done) — pricing data source
- `PricingCard` component (F001-002, done) — card UI
- `resend` package (installed) — contact form email sending
- Accordion component (shadcn, installed) — FAQ section

## Success Definition
We'll know this works when: A visitor can land on the homepage, understand the product value, compare pricing plans from live config data, submit a contact form that sends an email, and read all legal pages — all with a professional responsive design and distinct marketing navigation.
