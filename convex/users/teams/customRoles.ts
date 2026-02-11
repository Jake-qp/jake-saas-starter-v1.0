import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../functions";
import { vPermission, viewerHasPermissionX } from "../../permissions";
import { getTeamTier, tierHasFeature } from "../../../lib/planConfig";

/**
 * Custom roles CRUD for Enterprise tier (F001-004).
 *
 * Custom roles are team-scoped and can only be created/managed
 * by teams on the Enterprise plan.
 */

export const list = query({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, { teamId }) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) {
      return null;
    }

    return await ctx
      .table("teams")
      .getX(teamId)
      .edge("customRoles")
      .map((role) => ({
        _id: role._id,
        name: role.name,
        description: role.description,
        permissionNames: role.permissionNames,
      }));
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    description: v.optional(v.string()),
    permissionNames: v.array(vPermission),
  },
  async handler(ctx, { teamId, name, description, permissionNames }) {
    // 1. Authenticate + Authorize
    await viewerHasPermissionX(ctx, teamId, "Manage Team");

    // 2. Entitle: Enterprise tier only
    const team = await ctx.table("teams").getX(teamId);
    const tier = getTeamTier(team);
    if (!tierHasFeature(tier, "custom-roles")) {
      throw new ConvexError({
        message: "Custom roles are only available on the Enterprise plan",
        code: "PLAN_LIMIT_EXCEEDED",
        upgradeUrl: "/settings/billing",
      });
    }

    // 3. Check for duplicate name in this team
    const existing = await ctx
      .table("customRoles", "teamName", (q) =>
        q.eq("teamId", teamId).eq("name", name),
      )
      .unique();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (existing !== null) {
      throw new ConvexError("A custom role with this name already exists");
    }

    // 4. Execute
    return await ctx.table("customRoles").insert({
      teamId,
      name,
      description,
      permissionNames,
    });
  },
});

export const update = mutation({
  args: {
    customRoleId: v.id("customRoles"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    permissionNames: v.optional(v.array(vPermission)),
  },
  async handler(ctx, { customRoleId, name, description, permissionNames }) {
    const customRole = await ctx.table("customRoles").getX(customRoleId);

    // 1. Authenticate + Authorize
    await viewerHasPermissionX(ctx, customRole.teamId, "Manage Team");

    // 2. Entitle: Enterprise tier only
    const team = await ctx.table("teams").getX(customRole.teamId);
    const tier = getTeamTier(team);
    if (!tierHasFeature(tier, "custom-roles")) {
      throw new ConvexError({
        message: "Custom roles are only available on the Enterprise plan",
        code: "PLAN_LIMIT_EXCEEDED",
        upgradeUrl: "/settings/billing",
      });
    }

    // 3. Execute
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (permissionNames !== undefined) patch.permissionNames = permissionNames;

    await customRole.patch(patch);
  },
});

export const deleteCustomRole = mutation({
  args: {
    customRoleId: v.id("customRoles"),
  },
  async handler(ctx, { customRoleId }) {
    const customRole = await ctx.table("customRoles").getX(customRoleId);

    // 1. Authenticate + Authorize
    await viewerHasPermissionX(ctx, customRole.teamId, "Manage Team");

    // 2. Execute
    await customRole.delete();
  },
});
