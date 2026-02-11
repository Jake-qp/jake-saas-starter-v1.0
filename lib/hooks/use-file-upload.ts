"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FileUploadItem } from "@/components/FileUploader";
import type { FilePurpose } from "@/lib/fileConfig";

let uploadCounter = 0;

/**
 * Hook for uploading files to Convex storage.
 * Handles the 3-step flow: generateUploadUrl → POST to URL → saveFile.
 */
export function useFileUpload(teamId: Id<"teams"> | undefined) {
  const [uploads, setUploads] = useState<FileUploadItem[]>([]);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveFile = useMutation(api.storage.saveFile);

  const uploadFile = useCallback(
    async (file: File, purpose: FilePurpose) => {
      if (!teamId) return null;

      const id = `upload-${++uploadCounter}`;
      const item: FileUploadItem = {
        id,
        file,
        progress: 0,
        status: "uploading",
      };

      setUploads((prev) => [...prev, item]);

      try {
        // Step 1: Get upload URL
        const uploadUrl = await generateUploadUrl({ teamId });

        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: 30 } : u)),
        );

        // Step 2: Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error("Upload failed");
        }

        const { storageId } = await result.json();

        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: 70 } : u)),
        );

        // Step 3: Save file metadata
        const fileId = await saveFile({
          teamId,
          storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          purpose,
        });

        setUploads((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, progress: 100, status: "success" } : u,
          ),
        );

        return { fileId, storageId };
      } catch (error) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  progress: 0,
                  status: "error" as const,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : u,
          ),
        );
        return null;
      }
    },
    [teamId, generateUploadUrl, saveFile],
  );

  const uploadFiles = useCallback(
    async (files: File[], purpose: FilePurpose) => {
      return await Promise.all(files.map((file) => uploadFile(file, purpose)));
    },
    [uploadFile],
  );

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const retryUpload = useCallback(
    async (id: string, purpose: FilePurpose) => {
      const upload = uploads.find((u) => u.id === id);
      if (!upload) return;
      removeUpload(id);
      return await uploadFile(upload.file, purpose);
    },
    [uploads, removeUpload, uploadFile],
  );

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status !== "success"));
  }, []);

  return {
    uploads,
    uploadFile,
    uploadFiles,
    removeUpload,
    retryUpload,
    clearCompleted,
  };
}
