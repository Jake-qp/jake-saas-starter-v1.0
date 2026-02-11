/**
 * File upload configuration — single source of truth for file validation.
 * Used by both client-side components and server-side Convex mutations.
 *
 * @see F001-017 File Storage & Uploads
 */

/** Allowed MIME types by category */
export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  images: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  documents: ["application/pdf"],
  data: ["text/csv"],
};

/** Flat array of all allowed MIME types */
export const ALL_ALLOWED_TYPES = Object.values(ALLOWED_FILE_TYPES).flat();

/** Max file size per upload (10 MB) */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Avatar-specific allowed types (images only) */
export const AVATAR_ALLOWED_TYPES = ALLOWED_FILE_TYPES.images;

/** Avatar-specific max size (2 MB) */
export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;

/** Valid purposes for file uploads */
export const FILE_PURPOSES = ["avatar", "teamAvatar", "attachment"] as const;
export type FilePurpose = (typeof FILE_PURPOSES)[number];

/**
 * Validate a general file upload.
 * Returns null if valid, or an error message string.
 */
export function validateFileUpload(
  fileType: string,
  fileSize: number,
  allowedTypes: string[] = ALL_ALLOWED_TYPES,
  maxSize: number = MAX_FILE_SIZE_BYTES,
): string | null {
  if (fileSize === 0) return "File is empty";
  if (fileSize > maxSize)
    return `File exceeds ${formatFileSize(maxSize)} limit`;
  if (!allowedTypes.includes(fileType))
    return `File type "${fileType}" is not allowed`;
  return null;
}

/**
 * Validate an avatar upload (stricter: images only, 2 MB max).
 * Returns null if valid, or an error message string.
 */
export function validateAvatarUpload(
  fileType: string,
  fileSize: number,
): string | null {
  return validateFileUpload(
    fileType,
    fileSize,
    AVATAR_ALLOWED_TYPES,
    AVATAR_MAX_SIZE_BYTES,
  );
}

/**
 * Format byte count to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
