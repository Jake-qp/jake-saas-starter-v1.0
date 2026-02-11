"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { getPostHogClient } from "./client";

/**
 * Captures manual pageviews for App Router navigation.
 * PostHog's auto-pageview doesn't work with client-side routing,
 * so we capture $pageview on pathname/search changes.
 */
function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const posthog = getPostHogClient();
    if (!posthog || !pathname) return;

    let url = window.origin + pathname;
    if (searchParams.toString()) {
      url = url + "?" + searchParams.toString();
    }

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Suspense-wrapped pageview component.
 * useSearchParams() requires Suspense boundary in Next.js App Router.
 */
export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}
