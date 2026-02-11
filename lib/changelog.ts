import crypto from "crypto";

/**
 * Generate a unique unsubscribe token for changelog email subscribers.
 */
export function generateUnsubscribeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
