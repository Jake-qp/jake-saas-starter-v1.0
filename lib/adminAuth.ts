import { ConvexHttpClient } from "convex/browser";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";

/**
 * Verify the current user is a super admin from a Next.js API route.
 * Uses Convex auth token to query isSuperAdmin.
 * Returns true if super admin, false otherwise.
 */
export async function verifySuperAdmin(): Promise<boolean> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return false;

  const token = await convexAuthNextjsToken();
  if (!token) return false;

  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(token);

  try {
    const isSuperAdmin = await client.query(api.admin.isSuperAdmin);
    return isSuperAdmin === true;
  } catch {
    return false;
  }
}
