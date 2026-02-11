import { internalMutation } from "./functions";
import { getPermission } from "./permissions";
import { ALL_PERMISSIONS, ROLE_PERMISSION_MAP } from "./rbacConfig";

export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if ((await ctx.table("roles").first()) !== null) {
      throw new Error("There's an existing roles setup already.");
    }

    // Create all permissions
    await ctx
      .table("permissions")
      .insertMany(ALL_PERMISSIONS.map((name) => ({ name })));

    // Create Owner role (all permissions, not default)
    await ctx.table("roles").insert({
      name: "Owner",
      isDefault: false,
      permissions: await Promise.all(
        ROLE_PERMISSION_MAP.Owner.map((name) => getPermission(ctx, name)),
      ),
    });

    // Create Admin role (all except Transfer Ownership, Manage Billing)
    await ctx.table("roles").insert({
      name: "Admin",
      isDefault: false,
      permissions: await Promise.all(
        ROLE_PERMISSION_MAP.Admin.map((name) => getPermission(ctx, name)),
      ),
    });

    // Create Member role (basic permissions, default for new members)
    await ctx.table("roles").insert({
      name: "Member",
      isDefault: true,
      permissions: await Promise.all(
        ROLE_PERMISSION_MAP.Member.map((name) => getPermission(ctx, name)),
      ),
    });
  },
});
