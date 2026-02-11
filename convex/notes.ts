/**
 * Notes CRUD mutations and queries (F001-011).
 *
 * Full CRUD with:
 * - Permission gating (Contribute to create, Manage Content to delete others')
 * - Entitlement limits (Free: 50, Pro/Enterprise: unlimited)
 * - Full-text search via searchIndex
 * - Soft deletion
 * - File attachments via storage IDs
 */

import { v } from "convex/values";
import { mutation, query } from "./functions";
import { checkEntitlement } from "./entitlements";
import { viewerHasPermission, viewerWithPermissionX } from "./permissions";

/**
 * List notes for a team with optional search.
 * Requires team membership (any role).
 */
export const list = query({
  args: {
    teamId: v.id("teams"),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return null;

    let notes;
    if (args.search && args.search.trim().length > 0) {
      // Use search index for full-text search
      notes = await ctx
        .table("notes")
        .search("searchable", (q) =>
          q.search("searchable", args.search!).eq("teamId", args.teamId),
        )
        .filter((q) => q.eq(q.field("deletionTime"), undefined));
    } else {
      // List all notes for team, newest first
      notes = await ctx
        .table("teams")
        .getX(args.teamId)
        .edge("notes")
        .filter((q) => q.eq(q.field("deletionTime"), undefined));
      // Sort newest first (reverse chronological)
      notes.sort((a, b) => b._creationTime - a._creationTime);
    }

    // Resolve creator info for each note
    return await Promise.all(
      notes.map(async (note) => {
        const creator = await ctx.table("users").get(note.createdBy);
        return {
          _id: note._id,
          title: note.title,
          content: note.content,
          createdBy: {
            _id: note.createdBy,
            fullName: creator?.fullName ?? creator?.name ?? "Unknown",
            email: creator?.email ?? "",
          },
          attachmentStorageIds: note.attachmentStorageIds,
          _creationTime: note._creationTime,
        };
      }),
    );
  },
});

/**
 * Get a single note by ID.
 * Requires team membership.
 */
export const get = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return null;

    const note = await ctx.table("notes").get(args.noteId);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (!note || note.deletionTime !== undefined) return null;

    const creator = await ctx.table("users").get(note.createdBy);

    // Resolve attachment URLs
    const attachments = await Promise.all(
      note.attachmentStorageIds.map(async (storageId) => {
        const url = await ctx.storage.getUrl(storageId);
        // Find file metadata
        const team = await note.edge("team");
        const files = await team.edge("files");
        const fileMeta = files.find((f) => f.storageId === storageId);
        return {
          id: storageId,
          fileName: fileMeta?.fileName ?? "attachment",
          fileType: fileMeta?.fileType ?? "application/octet-stream",
          fileSize: fileMeta?.fileSize ?? 0,
          url: url ?? "",
        };
      }),
    );

    return {
      _id: note._id,
      title: note.title,
      content: note.content,
      teamId: note.teamId,
      createdBy: {
        _id: note.createdBy,
        fullName: creator?.fullName ?? creator?.name ?? "Unknown",
        email: creator?.email ?? "",
      },
      attachmentStorageIds: note.attachmentStorageIds,
      attachments,
      _creationTime: note._creationTime,
    };
  },
});

/**
 * Create a new note.
 * Pattern: Authenticate → Authorize (Contribute) → Entitle (notes limit) → Execute
 */
export const create = mutation({
  args: {
    teamId: v.id("teams"),
    title: v.string(),
    content: v.string(),
    attachmentStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const viewer = ctx.viewerX();

    // 2. Authorize — need "Contribute" permission
    await viewerWithPermissionX(ctx, args.teamId, "Contribute");

    // 3. Entitlement — check notes limit
    await checkEntitlement(ctx, args.teamId, "notes");

    // 4. Execute
    const storageIds = args.attachmentStorageIds ?? [];
    const noteId = await ctx.table("notes").insert({
      teamId: args.teamId,
      title: args.title,
      content: args.content,
      searchable: `${args.title} ${args.content}`,
      createdBy: viewer._id,
      attachmentStorageIds: storageIds,
    });

    return noteId;
  },
});

/**
 * Update an existing note.
 * Owner can edit their own notes. "Manage Content" can edit any note.
 */
export const update = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    attachmentStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const viewer = ctx.viewerX();

    // 2. Get note
    const note = await ctx.table("notes").getX(args.noteId);

    // 3. Authorize — must be creator OR have "Manage Content"
    if (note.createdBy !== viewer._id) {
      await viewerWithPermissionX(ctx, note.teamId, "Manage Content");
    }

    // 4. Execute
    const newTitle = args.title ?? note.title;
    const newContent = args.content ?? note.content;

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.content !== undefined) patch.content = args.content;
    if (args.title !== undefined || args.content !== undefined) {
      patch.searchable = `${newTitle} ${newContent}`;
    }
    if (args.attachmentStorageIds !== undefined) {
      patch.attachmentStorageIds = args.attachmentStorageIds;
    }

    await note.patch(patch);
  },
});

/**
 * Delete a note (soft delete).
 * Owner can delete their own notes. "Manage Content" can delete any note.
 */
export const remove = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const viewer = ctx.viewerX();

    // 2. Get note
    const note = await ctx.table("notes").getX(args.noteId);

    // 3. Authorize — must be creator OR have "Manage Content"
    if (note.createdBy !== viewer._id) {
      await viewerWithPermissionX(ctx, note.teamId, "Manage Content");
    }

    // 4. Soft delete
    await note.delete();
  },
});

/**
 * Search notes for the command palette.
 * Returns matching notes across title and content.
 */
export const search = query({
  args: {
    teamId: v.id("teams"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return [];

    if (!args.query.trim()) return [];

    const results = await ctx
      .table("notes")
      .search("searchable", (q) =>
        q.search("searchable", args.query).eq("teamId", args.teamId),
      )
      .filter((q) => q.eq(q.field("deletionTime"), undefined))
      .take(10);

    return results.map((note) => ({
      _id: note._id,
      title: note.title,
      _creationTime: note._creationTime,
    }));
  },
});

/**
 * Search members for the command palette.
 * Uses the existing members searchIndex.
 */
export const searchMembers = query({
  args: {
    teamId: v.id("teams"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return [];

    if (!args.query.trim()) return [];

    const results = await ctx
      .table("members")
      .search("searchable", (q) =>
        q.search("searchable", args.query).eq("teamId", args.teamId),
      )
      .filter((q) => q.eq(q.field("deletionTime"), undefined))
      .take(10);

    return await Promise.all(
      results.map(async (member) => {
        const user = await member.edge("user");
        return {
          _id: member._id,
          name: user.fullName ?? user.name ?? "Unknown",
          email: user.email ?? "",
        };
      }),
    );
  },
});

/**
 * Check if the viewer can manage content (delete others' notes).
 */
export const canManageContent = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- convex-ents false positive
    if (ctx.viewer === null) return false;
    return await viewerHasPermission(ctx, args.teamId, "Manage Content");
  },
});
