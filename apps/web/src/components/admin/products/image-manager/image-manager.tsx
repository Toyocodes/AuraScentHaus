"use client";

import { useRef } from "react";
import { quietly } from "@/components/form";
import type { ProductImageDTO } from "@aurascenthaus/shared";
import { Button } from "@/components/ui/button";
import { ImageTile } from "./image-tile";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export interface ImageManagerProps {
  images: ProductImageDTO[];
  isUploading?: boolean;
  /** Wire to `useUploadProductImages().mutateAsync({ productId, files })`. */
  onUpload?: (files: File[]) => void | Promise<void>;
  /** Wire to `useDeleteProductImage().mutate({ productId, imageId })`. */
  onDelete?: (imageId: string) => void;
}

/** Product photos. They're uploaded through the API to Supabase Storage. */
export function ImageManager({ images, isUploading, onUpload, onDelete }: ImageManagerProps) {
  const input = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    await quietly(() => onUpload?.(Array.from(files)))(undefined);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <ImageTile key={img.id} image={img} isCover={i === 0} onDelete={onDelete} />
          ))}
        </div>
      )}
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => void handleFiles(e.target.files)} />
      <Button type="button" variant="outline" disabled={isUploading} onClick={() => input.current?.click()}>
        {isUploading ? "Uploading…" : "Upload images"}
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP or AVIF, max 5 MB each. The first image is the cover.</p>
    </div>
  );
}
