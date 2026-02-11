import { NextResponse } from "next/server";
import { verifySuperAdmin } from "@/lib/adminAuth";
import {
  POSTHOG_FLAGS_API_URL,
  getPostHogHeaders,
} from "@/lib/featureFlagAdmin";

/**
 * PATCH /api/admin/flags/[id] — Toggle a feature flag active/inactive.
 * Requires isSuperAdmin (AC6).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  try {
    const body = await request.json();
    const response = await fetch(`${POSTHOG_FLAGS_API_URL}${id}/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ active: body.active }),
    });

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
      { error: "Failed to update feature flag" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/flags/[id] — Delete a feature flag.
 * Requires isSuperAdmin (AC6).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  try {
    const response = await fetch(`${POSTHOG_FLAGS_API_URL}${id}/`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok && response.status !== 204) {
      return NextResponse.json(
        { error: "PostHog API error" },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete feature flag" },
      { status: 500 },
    );
  }
}
