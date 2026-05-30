"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductImageUploaderProps {
  images: File[];
  onChange: (images: File[]) => void;
}

/**
 * Controlled multi-image uploader for product references.
 *
 * Accepts images via drag-and-drop or click through `react-dropzone`, renders
 * the selected files as a row of removable thumbnails, and previews each file
 * with an object URL that is revoked on remove/unmount to avoid memory leaks.
 */
export function ProductImageUploader({
  images,
  onChange,
}: ProductImageUploaderProps) {
  // Derive a stable object URL per file; revoke the previous batch whenever the
  // file list changes and on unmount so preview blobs are never leaked.
  const previews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onChange([...images, ...accepted]);
      }
    },
    [images, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeImage = (index: number) => {
    onChange(images.filter((_, current) => current !== index));
  };

  return (
    <div className="flex items-center gap-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex size-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:bg-muted",
          isDragActive && "border-primary bg-primary/10 text-primary",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="size-4" />
        <span className="text-[10px] font-medium tracking-wide uppercase">
          Upload
        </span>
      </div>

      {images.map((file, index) => (
        <div
          key={`${file.name}-${file.lastModified}-${index}`}
          className="group relative size-16 overflow-hidden rounded-lg bg-foreground"
        >
          {previews[index] && (
            // eslint-disable-next-line @next/next/no-img-element -- blob preview URL, not a remote asset for next/image
            <img
              src={previews[index]}
              alt={file.name}
              className="size-full object-cover"
            />
          )}
          <button
            type="button"
            aria-label="Remove image"
            onClick={() => removeImage(index)}
            className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="size-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
