"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { ProductImageDTO } from "@aurascenthaus/shared";

interface ImageTileProps {
  image: ProductImageDTO;
  isCover: boolean;
  onDelete?: (imageId: string) => void;
}

export function ImageTile({ image, isCover, onDelete }: ImageTileProps) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
      <Image src={image.url} alt={image.alt ?? ""} fill sizes="160px" className="object-cover" />
      {isCover && <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 text-[10px]">Cover</span>}
      <button
        type="button"
        onClick={() => onDelete?.(image.id)}
        className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Delete image"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
