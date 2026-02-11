# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-012
**Date:** 2026-02-11

Marketing Site & Legal Pages — landing page (hero, features grid, pricing table, FAQ, CTA), standalone /pricing page, /contact form with Resend, legal MDX pages (terms, privacy, cookies), distinct marketing layout.

**Files Created:**
- `app/(marketing)/layout.tsx` (marketing nav + footer)
- `app/(marketing)/page.tsx` (landing page)
- `app/(marketing)/_components/HeroSection.tsx`
- `app/(marketing)/_components/FeaturesGrid.tsx`
- `app/(marketing)/_components/PricingTable.tsx`
- `app/(marketing)/_components/FAQAccordion.tsx`
- `app/(marketing)/_components/CTASection.tsx`
- `app/(marketing)/pricing/page.tsx`
- `app/(marketing)/contact/page.tsx`
- `app/(marketing)/legal/layout.tsx`
- `app/(marketing)/legal/terms/page.tsx`
- `app/(marketing)/legal/privacy/page.tsx`
- `app/(marketing)/legal/cookies/page.tsx`
- `app/api/contact/route.ts` (Resend integration)
- `content/legal/terms.mdx`
- `content/legal/privacy.mdx`
- `content/legal/cookies.mdx`
- `lib/mdx.ts` (MDX file reader)
- `lib/contact-schema.ts` (Zod validation)
- `lib/marketing-content.ts` (features + FAQ data)

**Files Modified:**
- `tailwind.config.js` (added @tailwindcss/typography)
- `package.json` (next-mdx-remote, @tailwindcss/typography)

**Key Implementation:**
- PricingTable auto-populates from planConfig.ts, highlights "Pro" as recommended
- Contact form uses shared Zod schema (client + server) with Resend email sending
- Legal pages use next-mdx-remote/rsc for server-side MDX rendering
- Marketing layout completely separate from authenticated app layout

**Spec:** `docs/specs/F001-012-marketing-legal.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 212 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 7 complete (F001-001, F001-002, F001-003, F001-009, F001-012, F001-014, F001-016) | 10 pending
