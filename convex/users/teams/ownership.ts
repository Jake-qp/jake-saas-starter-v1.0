import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../functions";
import { getRole, viewerWithPermissionX } from "../../permissions";

/**
 * Transfer team ownership from the current owner to another member.
 *
 * Requirements (F001-004):
 * - Only the Owner can transfer ownership
 * - New owner must be an existing team member
 * - Old owner is demoted to Admin
 * - Email notifications sent to both (handled by caller/action)
 */
export const transferOwnership = mutation({
  args: {
    teamId: v.id("teams"),
    newOwnerMemberId: v.id("members"),
  },
  async handler(ctx, { teamId, newOwnerMemberId }) {
    // 1. Authenticate + Authorize: Must be Owner
    const currentMember = await viewerWithPermissionX(
      ctx,
      teamId,
      "Transfer Ownership",
    );

    // 2. Validate: New owner must be a member of this team
    const newOwnerMember = await ctx.table("members").getX(newOwnerMemberId);
    if (newOwnerMember.teamId !== teamId) {
      throw new ConvexError("Target member is not on this team");
    }
    if (newOwnerMember.deletionTime !== undefined) {
      throw new ConvexError("Target member has been removed from the team");
    }

    // 3. Prevent transfer to self
    if (newOwnerMember._id === currentMember._id) {
      throw new ConvexError("Cannot transfer ownership to yourself");
    }

    // 4. Execute: Swap roles
    const ownerRole = await getRole(ctx, "Owner");
    const adminRole = await getRole(ctx, "Admin");

    // Demote current owner to Admin
    await currentMember.patch({ roleId: adminRole._id });

    // Promote new owner to Owner
    await newOwnerMember.patch({ roleId: ownerRole._id });

    return {
      oldOwnerId: (await currentMember.edge("user"))._id,
      newOwnerId: (await newOwnerMember.edge("user"))._id,
    };
  },
});

/**
 * Get the current team owner (for the transfer dialog).
 */
export const getOwner = query({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, { teamId }) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) {
      return null;
    }

    const ownerRole = await getRole(ctx, "Owner");
    const members = await ctx
      .table("teams")
      .getX(teamId)
      .edge("members")
      .filter((q) =>
        q.and(
          q.eq(q.field("deletionTime"), undefined),
          q.eq(q.field("roleId"), ownerRole._id),
        ),
      );

    if (members.length === 0) return null;

    const ownerMember = members[0];
    const user = await ownerMember.edge("user");

    return {
      memberId: ownerMember._id,
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    };
  },
});

/**
 * Get non-owner members eligible to receive ownership transfer.
 */
export const getTransferCandidates = query({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, { teamId }) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) {
      return null;
    }

    const ownerRole = await getRole(ctx, "Owner");
    const members = await ctx
      .table("teams")
      .getX(teamId)
      .edge("members")
      .filter((q) =>
        q.and(
          q.eq(q.field("deletionTime"), undefined),
          q.neq(q.field("roleId"), ownerRole._id),
        ),
      );

    return await Promise.all(
      members.map(async (member) => {
        const user = await member.edge("user");
        return {
          memberId: member._id,
          fullName: user.fullName,
          email: user.email,
        };
      }),
    );
  },
});
