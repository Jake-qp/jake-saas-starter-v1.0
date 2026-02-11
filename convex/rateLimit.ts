import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * Rate limit configurations for the application.
 * Exported separately so tests can verify the config without needing
 * the Convex component runtime.
 */
export const RATE_LIMITS = {
  // Invite sending: 10 per minute per team, burst of 5
  sendInvite: {
    kind: "token bucket" as const,
    rate: 10,
    period: MINUTE,
    capacity: 5,
  },
  // AI requests: 20 per minute per team, burst of 5
  aiRequest: {
    kind: "token bucket" as const,
    rate: 20,
    period: MINUTE,
    capacity: 5,
  },
  // Failed login attempts: 5 per hour per email
  failedLogin: {
    kind: "token bucket" as const,
    rate: 5,
    period: HOUR,
    capacity: 5,
  },
};

export const rateLimiter = new RateLimiter(components.rateLimiter, RATE_LIMITS);
