import { entsTableFactory, scheduledDeleteFactory } from "convex-ents";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import {
  MutationCtx as BaseMutationCtx,
  QueryCtx as BaseQueryCtx,
  internalMutation as baseInternalMutation,
  internalQuery as baseInternalQuery,
  mutation as baseMutation,
  query as baseQuery,
} from "./_generated/server";
import { entDefinitions } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

export const query = customQuery(
  baseQuery,
  customCtx(async (baseCtx) => {
    return await queryCtx(baseCtx);
  }),
);

export const internalQuery = customQuery(
  baseInternalQuery,
  customCtx(async (baseCtx) => {
    return await queryCtx(baseCtx);
  }),
);

export const mutation = customMutation(
  baseMutation,
  customCtx(async (baseCtx) => {
    return await mutationCtx(baseCtx);
  }),
);

export const internalMutation = customMutation(
  baseInternalMutation,
  customCtx(async (baseCtx) => {
    return await mutationCtx(baseCtx);
  }),
);

async function queryCtx(baseCtx: BaseQueryCtx) {
  const ctx = {
    ...baseCtx,
    db: undefined,
    table: entsTableFactory(baseCtx, entDefinitions),
  };
  const userId = await getAuthUserId(baseCtx);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const viewer = userId === null ? null : await ctx.table("users").get(userId);
  const viewerX = () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (viewer === null) {
      throw new Error("Expected authenticated viewer");
    }
    return viewer;
  };
  return { ...ctx, viewer, viewerX };
}

async function mutationCtx(baseCtx: BaseMutationCtx) {
  const ctx = {
    ...baseCtx,
    db: undefined,
    table: entsTableFactory(baseCtx, entDefinitions),
  };
  const userId = await getAuthUserId(baseCtx);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const viewer = userId === null ? null : await ctx.table("users").get(userId);
  const viewerX = () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (viewer === null) {
      throw new Error("Expected authenticated viewer");
    }
    return viewer;
  };
  return { ...ctx, viewer, viewerX };
}

/**
 * Admin-only query wrapper. Enforces isSuperAdmin before handler runs.
 * Usage: export const myAdminQuery = adminQuery({ handler: async (ctx) => { ... } });
 */
export const adminQuery = customQuery(
  baseQuery,
  customCtx(async (baseCtx) => {
    const ctx = await queryCtx(baseCtx);
    const viewer = ctx.viewerX();
    if (!viewer.isSuperAdmin) {
      throw new Error("Only super admins can access this resource");
    }
    return ctx;
  }),
);

/**
 * Admin-only mutation wrapper. Enforces isSuperAdmin before handler runs.
 * Usage: export const myAdminMutation = adminMutation({ handler: async (ctx) => { ... } });
 */
export const adminMutation = customMutation(
  baseMutation,
  customCtx(async (baseCtx) => {
    const ctx = await mutationCtx(baseCtx);
    const viewer = ctx.viewerX();
    if (!viewer.isSuperAdmin) {
      throw new Error("Only super admins can access this resource");
    }
    return ctx;
  }),
);

export const scheduledDelete = scheduledDeleteFactory(entDefinitions);
