"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  UploadIcon,
  Cross2Icon,
  ReloadIcon,
  FileTextIcon,
  ImageIcon,
  TableIcon,
} from "@radix-ui/react-icons";
import { useCallback, useRef, useState } from "react";

/** Allowed MIME types for uploads */
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

export const ALL_ALLOWED_TYPES = Object.values(ALLOWED_FILE_TYPES).flat();

/** Max file size per upload (10 MB) */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Avatar-specific types */
export const AVATAR_ALLOWED_TYPES = ALLOWED_FILE_TYPES.images;
export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface FileUploaderProps {
  /** Called when files are selected/dropped */
  onUpload: (files: File[]) => void;
  /** Allowed MIME types */
  accept?: string[];
  /** Max file size in bytes */
  maxSize?: number;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Current upload items (controlled) */
  uploads?: FileUploadItem[];
  /** Remove an upload from the list */
  onRemove?: (id: string) => void;
  /** Retry a failed upload */
  onRetry?: (id: string) => void;
  /** Whether uploading is disabled (e.g., quota exceeded) */
  disabled?: boolean;
  /** Custom disabled message (e.g., quota info) */
  disabledMessage?: string;
  /** Custom label */
  label?: string;
  /** Compact mode (for inline attachment zones) */
  compact?: boolean;
  /** className */
  className?: string;
}

// Mock data for Phase 2 visual validation
const MOCK_UPLOADS: FileUploadItem[] = [
  {
    id: "mock-1",
    file: new File([], "quarterly-report.pdf"),
    progress: 100,
    status: "success",
  },
  {
    id: "mock-2",
    file: new File([], "screenshot.png"),
    progress: 65,
    status: "uploading",
  },
  {
    id: "mock-3",
    file: new File([], "data-export.csv"),
    progress: 0,
    status: "error",
    error: "File exceeds 10 MB limit",
  },
];

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")) {
    return <ImageIcon className="h-4 w-4" />;
  }
  if (ext === "csv") {
    return <TableIcon className="h-4 w-4" />;
  }
  return <FileTextIcon className="h-4 w-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function FileUploader({
  onUpload,
  accept = ALL_ALLOWED_TYPES,
  maxSize = MAX_FILE_SIZE_BYTES,
  multiple = true,
  uploads,
  onRemove,
  onRetry,
  disabled = false,
  disabledMessage,
  label,
  compact = false,
  className,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use mock data in Phase 2 when no uploads provided
  const displayUploads = uploads ?? MOCK_UPLOADS;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size === 0) return "File is empty";
      if (file.size > maxSize)
        return `File exceeds ${formatFileSize(maxSize)} limit`;
      if (!accept.includes(file.type))
        return `File type not allowed. Accepted: ${accept.map((t) => t.split("/")[1]).join(", ")}`;
      return null;
    },
    [accept, maxSize],
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;
      const files = Array.from(fileList);
      const validFiles: File[] = [];
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          // In production, this would create an error upload item
          console.warn(`Rejected file ${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    },
    [disabled, validateFile, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          compact ? "gap-1 p-4" : "gap-2 p-8",
          isDragOver && !disabled && "border-primary bg-primary/5",
          disabled
            ? "cursor-not-allowed border-border bg-muted opacity-60"
            : "cursor-pointer border-border hover:border-primary hover:bg-primary/5",
        )}
      >
        <UploadIcon
          className={cn(
            "text-muted-foreground",
            compact ? "h-5 w-5" : "h-8 w-8",
          )}
        />
        <div className="text-center">
          <p
            className={cn(
              "font-medium text-foreground",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {disabled
              ? (disabledMessage ?? "Upload disabled")
              : (label ??
                (isDragOver
                  ? "Drop files here"
                  : "Drag & drop files, or click to browse"))}
          </p>
          {!compact && !disabled && (
            <p className="mt-1 text-xs text-muted-foreground">
              Max {formatFileSize(maxSize)} per file
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Upload items */}
      {displayUploads.length > 0 && (
        <div className="space-y-2">
          {displayUploads.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-border p-2"
            >
              <div className="flex-shrink-0 text-muted-foreground">
                {getFileIcon(item.file.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                {item.status === "uploading" && (
                  <Progress value={item.progress} className="mt-1 h-1.5" />
                )}
                {item.status === "error" && (
                  <p className="mt-0.5 text-xs text-destructive">
                    {item.error}
                  </p>
                )}
                {item.status === "success" && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Uploaded
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {item.status === "error" && onRetry && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry(item.id);
                    }}
                  >
                    <ReloadIcon className="h-3 w-3" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                  >
                    <Cross2Icon className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
