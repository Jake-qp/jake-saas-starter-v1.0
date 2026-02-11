/**
 * File storage mutations and queries (F001-017).
 *
 * Handles file upload URL generation, file metadata storage,
 * avatar management, and file deletion with storage cleanup.
 */

import { v } from "convex/values";
import { mutation, query } from "./functions";
import { checkEntitlement } from "./entitlements";
import { validateFileUpload, validateAvatarUpload } from "../lib/fileConfig";

/**
 * Generate a signed upload URL for direct client-to-storage upload.
 * Requires authentication. Checks storage quota entitlement.
 */
export const generateUploadUrl = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    ctx.viewerX();

    // 2. Check storage quota entitlement
    await checkEntitlement(ctx, args.teamId, "storageQuotaMB");

    // 3. Generate upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Save file metadata after successful upload.
 * Called after the client uploads to the signed URL.
 */
export const saveFile = mutation({
  args: {
    teamId: v.id("teams"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const viewer = ctx.viewerX();

    // 2. Validate file type and size
    const validationFn =
      args.purpose === "avatar" || args.purpose === "teamAvatar"
        ? validateAvatarUpload
        : validateFileUpload;
    const error = validationFn(args.fileType, args.fileSize);
    if (error) {
      // Clean up the uploaded file since validation failed
      await ctx.storage.delete(args.storageId);
      throw new Error(error);
    }

    // 3. Check storage quota entitlement
    await checkEntitlement(ctx, args.teamId, "storageQuotaMB");

    // 4. Insert file record
    const fileId = await ctx.table("files").insert({
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedBy: viewer._id,
      purpose: args.purpose,
      teamId: args.teamId,
    });

    return fileId;
  },
});

/**
 * Save user avatar: uploads file, updates user record, deletes old avatar.
 */
export const saveUserAvatar = mutation({
  args: {
    teamId: v.id("teams"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = ctx.viewerX();

    // Validate avatar
    const error = validateAvatarUpload(args.fileType, args.fileSize);
    if (error) {
      await ctx.storage.delete(args.storageId);
      throw new Error(error);
    }

    // Check quota
    await checkEntitlement(ctx, args.teamId, "storageQuotaMB");

    // Delete old avatar file if exists
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (viewer.avatarStorageId) {
      await ctx.storage.delete(viewer.avatarStorageId);
      // Delete old file record
      const oldFiles = await ctx
        .table("files", "uploadedBy", (q) => q.eq("uploadedBy", viewer._id))
        .filter((q) => q.eq(q.field("purpose"), "avatar"));
      for (const oldFile of oldFiles) {
        await oldFile.delete();
      }
    }

    // Save new file record
    await ctx.table("files").insert({
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedBy: viewer._id,
      purpose: "avatar",
      teamId: args.teamId,
    });

    // Update user with new avatar
    const avatarUrl = await ctx.storage.getUrl(args.storageId);
    await viewer.patch({
      avatarStorageId: args.storageId,
      pictureUrl: avatarUrl ?? undefined,
    });

    return avatarUrl;
  },
});

/**
 * Save team avatar: uploads file, updates team record, deletes old avatar.
 */
export const saveTeamAvatar = mutation({
  args: {
    teamId: v.id("teams"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = ctx.viewerX();

    // Validate avatar
    const error = validateAvatarUpload(args.fileType, args.fileSize);
    if (error) {
      await ctx.storage.delete(args.storageId);
      throw new Error(error);
    }

    // Check quota
    await checkEntitlement(ctx, args.teamId, "storageQuotaMB");

    const team = await ctx.table("teams").getX(args.teamId);

    // Delete old team avatar if exists
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (team.avatarStorageId) {
      await ctx.storage.delete(team.avatarStorageId);
      // Delete old file record
      const oldFiles = await ctx.table("files", "teamPurpose", (q) =>
        q.eq("teamId", args.teamId).eq("purpose", "teamAvatar"),
      );
      for (const oldFile of oldFiles) {
        await oldFile.delete();
      }
    }

    // Save new file record
    await ctx.table("files").insert({
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedBy: viewer._id,
      purpose: "teamAvatar",
      teamId: args.teamId,
    });

    // Update team with new avatar
    await team.patch({ avatarStorageId: args.storageId });

    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file: removes storage blob and database record.
 */
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    ctx.viewerX();
    const file = await ctx.table("files").getX(args.fileId);

    // Delete the storage blob
    await ctx.storage.delete(file.storageId);

    // Delete the database record
    await file.delete();
  },
});

/**
 * Remove user avatar.
 */
export const removeUserAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = ctx.viewerX();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (viewer.avatarStorageId) {
      await ctx.storage.delete(viewer.avatarStorageId);
      // Delete file record
      const avatarFiles = await ctx
        .table("files", "uploadedBy", (q) => q.eq("uploadedBy", viewer._id))
        .filter((q) => q.eq(q.field("purpose"), "avatar"));
      for (const file of avatarFiles) {
        await file.delete();
      }
    }

    await viewer.patch({
      avatarStorageId: undefined,
      pictureUrl: undefined,
    });
  },
});

/**
 * Remove team avatar.
 */
export const removeTeamAvatar = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    ctx.viewerX();
    const team = await ctx.table("teams").getX(args.teamId);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (team.avatarStorageId) {
      await ctx.storage.delete(team.avatarStorageId);
      // Delete file record
      const avatarFiles = await ctx.table("files", "teamPurpose", (q) =>
        q.eq("teamId", args.teamId).eq("purpose", "teamAvatar"),
      );
      for (const file of avatarFiles) {
        await file.delete();
      }
    }

    await team.patch({ avatarStorageId: undefined });
  },
});

/**
 * Get file URL from storage ID.
 */
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * List files for a team by purpose.
 */
export const listTeamFiles = query({
  args: {
    teamId: v.id("teams"),
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.viewer === null) return null;

    let files;
    if (args.purpose) {
      files = await ctx.table("files", "teamPurpose", (q) =>
        q.eq("teamId", args.teamId).eq("purpose", args.purpose!),
      );
    } else {
      files = await ctx.table("teams").getX(args.teamId).edge("files");
    }

    // Resolve URLs for each file
    return await Promise.all(
      files.map(async (file) => ({
        _id: file._id,
        storageId: file.storageId,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        purpose: file.purpose,
        url: await ctx.storage.getUrl(file.storageId),
        _creationTime: file._creationTime,
      })),
    );
  },
});

/**
 * Get storage usage for a team in bytes.
 */
export const getStorageUsage = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.viewer === null) return null;

    const files = await ctx.table("teams").getX(args.teamId).edge("files");
    const totalBytes = files.reduce((sum, file) => sum + file.fileSize, 0);
    return totalBytes;
  },
});
