import { NextResponse } from "next/server";
import { verifySuperAdmin } from "@/lib/adminAuth";
import {
  POSTHOG_FLAGS_API_URL,
  getPostHogHeaders,
} from "@/lib/featureFlagAdmin";

/**
 * GET /api/admin/flags — List all feature flags from PostHog.
 * Requires isSuperAdmin (AC6).
 */
export async function GET() {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const headers = getPostHogHeaders();
  if (!headers) {
    return NextResponse.json(
      { error: "PostHog personal API key not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(POSTHOG_FLAGS_API_URL, { headers });
    if (!response.ok) {
      return NextResponse.json(
        { error: "PostHog API error" },
        { status: response.status },
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/flags — Create a new feature flag in PostHog.
 * Requires isSuperAdmin (AC6).
 */
export async function POST(request: Request) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const headers = getPostHogHeaders();
  if (!headers) {
    return NextResponse.json(
      { error: "PostHog personal API key not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(POSTHOG_FLAGS_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        key: body.key,
        name: body.name || body.key,
        active: false,
        filters: {},
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: "PostHog API error", details: err },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 },
    );
  }
}
