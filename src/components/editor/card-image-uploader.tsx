"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface CardImageUploaderProps {
  image: File | null;
  onChange: (image: File | null) => void;
  label: string;
}

export function CardImageUploader({
  image,
  onChange,
  label,
}: CardImageUploaderProps) {
  const preview = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  if (image && preview) {
    return (
      <div className="group relative h-36 overflow-hidden rounded-lg bg-foreground">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL, not a next/image asset */}
        <img src={preview} alt={label} className="size-full object-cover" />
        <button
          type="button"
          aria-label="Remove image"
          onClick={() => onChange(null)}
          className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="size-2.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-300 border-dashed text-muted-foreground transition-colors hover:bg-muted",
        isDragActive && "border-primary bg-primary/10 text-primary",
      )}
    >
      <input {...getInputProps()} />
      <Upload className="size-5" />
      <span className="text-sm">+ Upload {label}</span>
    </div>
  );
}
