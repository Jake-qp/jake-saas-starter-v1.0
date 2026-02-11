"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Cross2Icon,
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  TableIcon,
} from "@radix-ui/react-icons";
import { formatFileSize } from "@/lib/fileConfig";

export interface FileAttachmentData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface FileAttachmentProps {
  attachment: FileAttachmentData;
  /** Whether the attachment can be deleted */
  canDelete?: boolean;
  /** Called when delete is clicked */
  onDelete?: (id: string) => void;
  className?: string;
}

function isImageType(fileType: string): boolean {
  return fileType.startsWith("image/");
}

function getFileIcon(fileType: string) {
  if (isImageType(fileType)) return <ImageIcon className="h-4 w-4" />;
  if (fileType === "text/csv") return <TableIcon className="h-4 w-4" />;
  return <FileTextIcon className="h-4 w-4" />;
}

export function FileAttachment({
  attachment,
  canDelete = false,
  onDelete,
  className,
}: FileAttachmentProps) {
  const isImage = isImageType(attachment.fileType);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className,
      )}
    >
      {/* Inline image preview */}
      {isImage && attachment.url && (
        <div className="relative bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.url}
            alt={attachment.fileName}
            className="max-h-64 w-full object-contain"
          />
        </div>
      )}

      {/* File info bar */}
      <div className="flex items-center gap-2 p-2">
        <div className="flex-shrink-0 text-muted-foreground">
          {getFileIcon(attachment.fileType)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{attachment.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(attachment.fileSize)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {attachment.url && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <a
                href={attachment.url}
                download={attachment.fileName}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(attachment.id)}
            >
              <Cross2Icon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Renders a list of attachments with image previews and download links */
export function FileAttachmentList({
  attachments,
  canDelete = false,
  onDelete,
  className,
}: {
  attachments: FileAttachmentData[];
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  className?: string;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {attachments.map((attachment) => (
        <FileAttachment
          key={attachment.id}
          attachment={attachment}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
