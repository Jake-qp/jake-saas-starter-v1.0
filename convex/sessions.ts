import { getAuthSessionId } from "@convex-dev/auth/server";
import { mutation } from "./functions";

// Invalidate all sessions except the current one ("Log out all other devices")
export const invalidateOtherSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = ctx.viewerX();
    // Get current session ID
    const currentSessionId = await getAuthSessionId(ctx);
    if (!currentSessionId) {
      throw new Error("No current session");
    }

    // Get all sessions for this user via raw db
    const allSessions = await ctx.table("authSessions", "userId", (q) =>
      q.eq("userId", viewer._id),
    );

    const now = Date.now();
    let invalidatedCount = 0;

    for (const session of allSessions) {
      // Skip current session and already-expired sessions
      if (session._id === currentSessionId || session.expirationTime <= now) {
        continue;
      }
      // Expire the session by setting expirationTime to now
      await session.patch({ expirationTime: now });
      invalidatedCount++;
    }

    return { invalidatedCount };
  },
});
