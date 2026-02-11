import { describe, expect, it } from "vitest";
import schema from "../schema";
import {
  ALLOWED_FILE_TYPES,
  ALL_ALLOWED_TYPES,
  MAX_FILE_SIZE_BYTES,
  AVATAR_ALLOWED_TYPES,
  AVATAR_MAX_SIZE_BYTES,
  FILE_PURPOSES,
  validateFileUpload,
  validateAvatarUpload,
  formatFileSize,
} from "../../lib/fileConfig";
import { PLAN_CONFIG } from "../../lib/planConfig";

/**
 * File Storage & Uploads tests (F001-017).
 *
 * Tests schema changes, file validation, storage quota configuration,
 * and file upload constants.
 */

describe("storage schema (F001-017)", () => {
  describe("files table", () => {
    it("should define the files table", () => {
      expect(schema.tables.files).toBeDefined();
    });

    it("should have teamPurpose index on files", () => {
      const filesTable = schema.tables.files;
      const indexNames = filesTable.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("teamPurpose");
    });

    it("should have uploadedBy index on files", () => {
      const filesTable = schema.tables.files;
      const indexNames = filesTable.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("uploadedBy");
    });
  });

  describe("users table avatar field", () => {
    it("should still define the users table", () => {
      expect(schema.tables.users).toBeDefined();
    });
  });

  describe("teams table avatar field", () => {
    it("should still define the teams table", () => {
      expect(schema.tables.teams).toBeDefined();
    });
  });
});

describe("file validation (F001-017)", () => {
  describe("file type configuration", () => {
    it("should define image types", () => {
      expect(ALLOWED_FILE_TYPES.images).toContain("image/jpeg");
      expect(ALLOWED_FILE_TYPES.images).toContain("image/png");
      expect(ALLOWED_FILE_TYPES.images).toContain("image/gif");
      expect(ALLOWED_FILE_TYPES.images).toContain("image/webp");
      expect(ALLOWED_FILE_TYPES.images).toContain("image/svg+xml");
    });

    it("should define document types", () => {
      expect(ALLOWED_FILE_TYPES.documents).toContain("application/pdf");
    });

    it("should define data types", () => {
      expect(ALLOWED_FILE_TYPES.data).toContain("text/csv");
    });

    it("should aggregate all allowed types", () => {
      const allTypes = [
        ...ALLOWED_FILE_TYPES.images,
        ...ALLOWED_FILE_TYPES.documents,
        ...ALLOWED_FILE_TYPES.data,
      ];
      expect(ALL_ALLOWED_TYPES).toEqual(allTypes);
    });
  });

  describe("file size limits", () => {
    it("should set max file size to 10 MB", () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });

    it("should set avatar max size to 2 MB", () => {
      expect(AVATAR_MAX_SIZE_BYTES).toBe(2 * 1024 * 1024);
    });
  });

  describe("avatar types", () => {
    it("should only allow image types for avatars", () => {
      expect(AVATAR_ALLOWED_TYPES).toEqual(ALLOWED_FILE_TYPES.images);
    });
  });

  describe("file purposes", () => {
    it("should define avatar purpose", () => {
      expect(FILE_PURPOSES).toContain("avatar");
    });

    it("should define teamAvatar purpose", () => {
      expect(FILE_PURPOSES).toContain("teamAvatar");
    });

    it("should define attachment purpose", () => {
      expect(FILE_PURPOSES).toContain("attachment");
    });
  });

  describe("validateFileUpload", () => {
    it("should accept valid file", () => {
      const result = validateFileUpload("image/png", 1024);
      expect(result).toBeNull();
    });

    it("should reject empty file", () => {
      const result = validateFileUpload("image/png", 0);
      expect(result).toBe("File is empty");
    });

    it("should reject file exceeding size limit", () => {
      const result = validateFileUpload("image/png", MAX_FILE_SIZE_BYTES + 1);
      expect(result).toContain("exceeds");
    });

    it("should reject disallowed file type", () => {
      const result = validateFileUpload("application/exe", 1024);
      expect(result).toContain("not allowed");
    });

    it("should accept PDF files", () => {
      const result = validateFileUpload("application/pdf", 1024);
      expect(result).toBeNull();
    });

    it("should accept CSV files", () => {
      const result = validateFileUpload("text/csv", 1024);
      expect(result).toBeNull();
    });
  });

  describe("validateAvatarUpload", () => {
    it("should accept valid avatar image", () => {
      const result = validateAvatarUpload("image/png", 1024);
      expect(result).toBeNull();
    });

    it("should reject avatar exceeding 2 MB", () => {
      const result = validateAvatarUpload(
        "image/png",
        AVATAR_MAX_SIZE_BYTES + 1,
      );
      expect(result).toContain("2.0 MB");
    });

    it("should reject non-image types for avatars", () => {
      const result = validateAvatarUpload("application/pdf", 1024);
      expect(result).toContain("not allowed");
    });

    it("should accept WebP avatars", () => {
      const result = validateAvatarUpload("image/webp", 1024);
      expect(result).toBeNull();
    });
  });

  describe("formatFileSize", () => {
    it("should format 0 bytes", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("should format bytes", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1048576)).toBe("1.0 MB");
    });

    it("should format fractional megabytes", () => {
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
    });
  });
});

describe("storage quota configuration (F001-017)", () => {
  it("should define storageQuotaMB for free tier", () => {
    expect(PLAN_CONFIG.free.limits.storageQuotaMB).toBe(100);
  });

  it("should define storageQuotaMB for pro tier", () => {
    expect(PLAN_CONFIG.pro.limits.storageQuotaMB).toBe(1000);
  });

  it("should define unlimited storageQuotaMB for enterprise", () => {
    expect(PLAN_CONFIG.enterprise.limits.storageQuotaMB).toBe(-1);
  });

  it("should have storageQuotaMB as a valid LimitKey", () => {
    // This is a compile-time check — if storageQuotaMB is not a LimitKey,
    // TypeScript would error here
    const key: keyof (typeof PLAN_CONFIG)["free"]["limits"] = "storageQuotaMB";
    expect(key).toBe("storageQuotaMB");
  });
});
