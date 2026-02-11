"use client";

import { useEffect, type ReactNode } from "react";
import { getPostHogClient } from "./client";

/**
 * PostHog provider component. Initializes PostHog client on mount.
 * Renders children unconditionally — PostHog is optional.
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize PostHog client (no-op if env var missing)
    getPostHogClient();
  }, []);

  return <>{children}</>;
}
