import { query } from "./functions";

/**
 * Check if the current user is a super admin.
 * Returns false for unauthenticated users.
 */
export const isSuperAdmin = query({
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return false;
    return ctx.viewer.isSuperAdmin === true;
  },
});
