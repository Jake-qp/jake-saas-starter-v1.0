/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // V1 codebase has ~112 pre-existing TS errors (convex-ents deep types).
    // Type checking runs separately via `npm run type-check`.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
