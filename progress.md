# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-015
**Date:** 2026-02-11

Waitlist / Pre-Launch Mode — 22 new tests, 6/6 ACs.

**Files Created:**
- `convex/waitlist.ts` — joinWaitlist, getWaitlistCount, listWaitlistEntries, approveEntry, rejectEntry
- `convex/__tests__/waitlist.test.ts` — 22 tests
- `app/(marketing)/waitlist/page.tsx` — public waitlist page
- `app/(marketing)/_components/WaitlistGate.tsx` — feature flag redirect
- `app/admin/waitlist/page.tsx` — admin waitlist management
- `app/api/waitlist/send-invite/route.ts` — Resend invitation email

**Files Modified:**
- `convex/schema.ts` — waitlistEntries table
- `app/(marketing)/page.tsx` — added WaitlistGate
- `app/admin/layout.tsx` — added Waitlist nav item

**Spec:** `docs/specs/F001-015-waitlist.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅

---

## Project State
- **Tests:** 456 passing (6 todo seeds)
- **Build:** ✅ succeeds
- **Features:** 17 complete | 0 in progress | 0 pending
