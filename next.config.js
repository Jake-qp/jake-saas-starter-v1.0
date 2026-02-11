const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // V1 codebase has ~112 pre-existing TS errors (convex-ents deep types).
    // Type checking runs separately via `npm run type-check`.
    ignoreBuildErrors: true,
  },
  experimental: {
    // Required for instrumentation.ts in Next.js 14
    instrumentationHook: true,
  },
  async rewrites() {
    return [
      // PostHog reverse proxy — avoids ad-blockers
      // PostHog client (F001-009) will point to /ph instead of us.i.posthog.com
      {
        source: "/ph/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ph/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

// Only wrap with Sentry when DSN is configured (avoids build-time sourcemap
// upload errors when SENTRY_AUTH_TOKEN is not set, e.g. local dev)
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,

      // Tunnel Sentry events through /monitoring to avoid ad-blockers
      tunnelRoute: "/monitoring",

      silent: !process.env.CI,
      widenClientFileUpload: true,

      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },

      // Gracefully warn (don't fail) on source map upload errors
      errorHandler: (err) => {
        console.warn(
          "[@sentry/nextjs] Source map upload warning:",
          err.message
        );
      },
    })
  : nextConfig;
