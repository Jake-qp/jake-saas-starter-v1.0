# ADR-006: Vercel for Deployment
**Status:** Accepted
**Date:** 2026-02-10

## Context
The boilerplate needs a deployment target. Options: Vercel (optimized for Next.js), AWS/GCP (flexible but complex), self-hosted (maximum control). The frontend is Next.js 14 App Router; the backend is Convex (hosted on `.convex.cloud`).

## Decision
Deploy on Vercel with GitHub auto-deploy. Build command: `npx convex deploy --cmd 'npm run build'`. Preview deploys get isolated Convex backends with seed data via `--preview-run 'seedPreview'`.

## Consequences
- Zero-config deployment for Next.js — optimized edge functions, ISR, image optimization
- GitHub integration provides automatic preview deploys per PR
- Convex backend deploys alongside frontend via `convex deploy --cmd`
- Preview deploys get isolated backends — safe for PR reviews
- Vendor lock-in to Vercel — acceptable for a boilerplate (developers can migrate if needed)
- Environment variables split between Vercel Dashboard (frontend) and Convex Dashboard (backend)
