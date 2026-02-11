import { Infer, v } from "convex/values";
import { MutationCtx, QueryCtx } from "./types";
import { Id } from "./_generated/dataModel";

export const vPermission = v.union(
  v.literal("Manage Team"),
  v.literal("Delete Team"),
  v.literal("Read Members"),
  v.literal("Manage Members"),
  v.literal("Contribute"),
  // F001-004: Enhanced RBAC permissions
  v.literal("Transfer Ownership"),
  v.literal("View Billing"),
  v.literal("Manage Billing"),
  v.literal("Upload Files"),
  v.literal("Delete Files"),
  v.literal("Use AI"),
  v.literal("View Analytics"),
  v.literal("Manage Integrations"),
  v.literal("Invite Members"),
  // F001-011: Notes CRUD permission
  v.literal("Manage Content"),
);
export type Permission = Infer<typeof vPermission>;

export const vRole = v.union(
  v.literal("Owner"),
  v.literal("Admin"),
  v.literal("Member"),
);
export type Role = Infer<typeof vRole>;

export async function getPermission(ctx: QueryCtx, name: Permission) {
  return (await ctx.table("permissions").getX("name", name))._id;
}

export async function getRole(ctx: QueryCtx, name: Role) {
  return await ctx.table("roles").getX("name", name);
}

export async function viewerWithPermission(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  name: Permission,
) {
  const member = await ctx
    .table("members", "teamUser", (q) =>
      q.eq("teamId", teamId).eq("userId", ctx.viewerX()._id),
    )
    .unique();
  /* eslint-disable @typescript-eslint/no-unnecessary-condition -- convex-ents false positive */
  if (
    member === null ||
    member.deletionTime !== undefined ||
    !(await member
      .edge("role")
      .edge("permissions")
      .has(await getPermission(ctx, name)))
  ) {
    return null;
  }
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */
  return member;
}

export async function viewerHasPermission(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  name: Permission,
) {
  const member = await viewerWithPermission(ctx, teamId, name);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
  return member !== null;
}

export async function viewerWithPermissionX(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  name: Permission,
) {
  const member = await viewerWithPermission(ctx, teamId, name);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
  if (member === null) {
    throw new Error(`Viewer does not have the permission "${name}"`);
  }
  return member;
}

export async function viewerHasPermissionX(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  name: Permission,
) {
  await viewerWithPermissionX(ctx, teamId, name);
  return true;
}
