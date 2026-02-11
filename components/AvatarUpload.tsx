"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { useCallback, useRef, useState } from "react";
import {
  AVATAR_ALLOWED_TYPES,
  AVATAR_MAX_SIZE_BYTES,
} from "@/components/FileUploader";

export interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatarUrl?: string | null;
  /** Fallback text (initials) */
  fallback: string;
  /** Called when a new avatar file is selected */
  onUpload: (file: File) => void;
  /** Called when avatar is removed */
  onRemove?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Disabled state */
  disabled?: boolean;
  /** Label text below avatar */
  label?: string;
  className?: string;
}

// Mock avatar URL for Phase 2 visual validation
const MOCK_AVATAR_URL = null; // Show fallback to demonstrate both states

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const buttonSizeClasses = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-8 w-8",
};

export function AvatarUpload({
  currentAvatarUrl,
  fallback,
  onUpload,
  onRemove,
  size = "lg",
  disabled = false,
  label,
  className,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Use mock data for Phase 2 when currentAvatarUrl is not provided
  const displayUrl = currentAvatarUrl ?? MOCK_AVATAR_URL;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size === 0) {
        setError("File is empty");
        return;
      }
      if (file.size > AVATAR_MAX_SIZE_BYTES) {
        setError("Image must be under 2 MB");
        return;
      }
      if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, GIF, WebP, and SVG are allowed");
        return;
      }

      onUpload(file);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [onUpload],
  );

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          {displayUrl && <AvatarImage src={displayUrl} alt="Avatar" />}
          <AvatarFallback
            className={cn("text-sm font-medium", size === "lg" && "text-lg")}
          >
            {fallback}
          </AvatarFallback>
        </Avatar>
        {!disabled && (
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "absolute -bottom-1 -right-1 rounded-full border border-border shadow-sm",
              buttonSizeClasses[size],
            )}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Pencil1Icon className={iconSizeClasses[size]} />
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {displayUrl && onRemove && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          type="button"
        >
          Remove avatar
        </Button>
      )}
    </div>
  );
}
